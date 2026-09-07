const userRepository = require('../repositories/user.repository');
const { createUserEntity, toPublicUser } = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signPasswordResetToken,
  verifyPasswordResetToken,
} = require('../utils/jwt');
const { generateUserId } = require('../helpers/idHelper');
const { nowISO } = require('../helpers/dateHelper');
const { ROLES } = require('../constants/roles');
const { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } = require('../errors/AppError');
const { env } = require('../config/env');
const { awsInfrastructure } = require('../config/aws');
const cognitoService = require('../aws/cognito.service');
const emailService = require('./email.service');
const activityLogRepository = require('../repositories/activityLog.repository');
const { createActivityLogEntity } = require('../models/activityLog.model');
const { generateActivityId } = require('../helpers/idHelper');

class AuthService {
  async register({ email, password, name, role = ROLES.CITIZEN, phone }) {
    if (awsInfrastructure.cognito.useCognito && awsInfrastructure.cognito.userPoolId) {
      await cognitoService.signUp({ email, password, name, role });
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const allUsers = await userRepository.findAll();
    const assignedRole =
      allUsers.length === 0 ? ROLES.ADMIN : role === ROLES.ADMIN ? ROLES.CITIZEN : role;

    const userId = generateUserId();
    const hashedPassword = await hashPassword(password);
    const timestamp = nowISO();

    const user = createUserEntity({
      userId,
      email,
      password: hashedPassword,
      name,
      role: assignedRole,
      phone,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await userRepository.create(user);
    await this._logActivity('user', userId, 'USER_REGISTERED', userId);

    // Automatically subscribe new user to SNS Emergency Alerts Topic
    const snsService = require('../aws/sns.service');
    if (awsInfrastructure.sns.emergencyAlertsTopic) {
      await snsService.subscribeEmail(awsInfrastructure.sns.emergencyAlertsTopic, email);
    }

    if (awsInfrastructure.cognito.useCognito) {
      return this.login({ email, password });
    }

    const tokens = this._generateTokens(user);
    return { user: toPublicUser(user), tokens };
  }

  async login({ email, password }) {
    if (awsInfrastructure.cognito.useCognito) {
      const authResult = await cognitoService.signIn({ email, password });
      const user = await userRepository.findByEmail(email);
      if (!user || !user.isActive) throw new UnauthorizedError('User not found or inactive');
      
      const tokens = {
        accessToken: authResult.IdToken, // Using IdToken so frontend sends it, allowing us to read the email claim
        refreshToken: authResult.RefreshToken,
        idToken: authResult.IdToken,
        tokenType: 'Bearer',
        expiresIn: authResult.ExpiresIn,
      };
      await this._storeRefreshToken(user.userId, tokens.refreshToken);
      return { user: toPublicUser(user), tokens };
    }

    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user.userId, tokens.refreshToken);

    return { user: toPublicUser(user), tokens };
  }

  async refreshToken(refreshToken) {
    if (awsInfrastructure.cognito.useCognito) {
      try {
        const { AdminInitiateAuthCommand } = require('@aws-sdk/client-cognito-identity-provider');
        const result = await cognitoService.client.send(
          new AdminInitiateAuthCommand({
            UserPoolId: cognitoService.userPoolId,
            ClientId: cognitoService.clientId,
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            AuthParameters: { REFRESH_TOKEN: refreshToken },
          })
        );
        
        const newTokens = {
          accessToken: result.AuthenticationResult.IdToken,
          idToken: result.AuthenticationResult.IdToken,
          refreshToken: refreshToken,
          tokenType: 'Bearer',
          expiresIn: result.AuthenticationResult.ExpiresIn,
        };

        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(result.AuthenticationResult.IdToken);
        const user = await userRepository.findByEmail(decoded.email);
        
        if (!user || !user.isActive) throw new UnauthorizedError('User not found or inactive');
        await this._storeRefreshToken(user.userId, refreshToken);
        return { user: toPublicUser(user), tokens: newTokens };
      } catch (error) {
        throw new UnauthorizedError('Invalid refresh token');
      }
    }

    const decoded = verifyRefreshToken(refreshToken);
    const stored = await this._getRefreshToken(decoded.userId);
    if (!stored || stored !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    const tokens = this._generateTokens(user);
    await this._storeRefreshToken(user.userId, tokens.refreshToken);
    return { user: toPublicUser(user), tokens };
  }

  async logout(userId, refreshToken) {
    await this._removeRefreshToken(userId, refreshToken);
    await this._logActivity('user', userId, 'USER_LOGOUT', userId);
    return { loggedOut: true };
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a reset link will be sent' };
    }

    if (awsInfrastructure.cognito.useCognito) {
      await cognitoService.forgotPassword(email);
      return { message: 'Password reset code sent via email' };
    }

    const resetToken = signPasswordResetToken({ userId: user.userId, email: user.email });
    await this._storePasswordResetToken(user.userId, resetToken);

    const resetUrl = `${env.passwordReset.frontendUrl}/reset-password?token=${resetToken}`;
    
    // Send email using Nodemailer
    await emailService.sendPasswordResetEmail(user.email, resetUrl);

    return {
      message: 'If the email exists, a reset link will be sent',
      ...(env.isDevelopment && { resetUrl, resetToken }),
    };
  }

  async resetPassword({ token, newPassword, email }) {
    if (awsInfrastructure.cognito.useCognito) {
      if (!email) throw new BadRequestError('Email is required for Cognito reset');
      await cognitoService.confirmForgotPassword({ email, code: token, newPassword });
      
      const user = await userRepository.findByEmail(email);
      if (user) {
        const hashedPassword = await hashPassword(newPassword);
        await userRepository.update(user.userId, { password: hashedPassword });
      }
      return { message: 'Password reset successfully' };
    }

    const decoded = verifyPasswordResetToken(token);
    const stored = await this._getPasswordResetToken(decoded.userId);
    if (!stored || stored !== token) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) throw new NotFoundError('User not found');

    const hashedPassword = await hashPassword(newPassword);
    await userRepository.update(user.userId, { password: hashedPassword });
    await this._removePasswordResetToken(user.userId);

    return { message: 'Password reset successfully' };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return toPublicUser(user);
  }

  async updateProfile(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    
    await userRepository.update(userId, {
      name: data.name,
      phone: data.phone,
      avatarKey: data.avatarKey ?? user.avatarKey ?? null,
      avatarUrl: data.avatarUrl ?? user.avatarUrl ?? null,
    });
    
    return this.getProfile(userId);
  }

  async updatePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    
    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new UnauthorizedError('Current password is incorrect');
    
    const hashedPassword = await hashPassword(newPassword);
    await userRepository.update(userId, { password: hashedPassword });
    
    return { message: 'Password updated successfully' };
  }

  _generateTokens(user) {
    const payload = { userId: user.userId, email: user.email, role: user.role };
    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      tokenType: 'Bearer',
      expiresIn: env.jwt.accessExpiresIn,
    };
  }

  async _storeRefreshToken(userId, token) {
    await userRepository.update(userId, { refreshToken: token });
  }

  async _getRefreshToken(userId) {
    const user = await userRepository.findById(userId);
    if (user?.refreshToken) return user.refreshToken;
    return null;
  }

  async _removeRefreshToken(userId) {
    await userRepository.update(userId, { refreshToken: null });
  }

  async _storePasswordResetToken(userId, token) {
    await userRepository.update(userId, { passwordResetToken: token });
  }

  async _getPasswordResetToken(userId) {
    const user = await userRepository.findById(userId);
    if (user?.passwordResetToken) return user.passwordResetToken;
    return null;
  }

  async _removePasswordResetToken(userId) {
    await userRepository.update(userId, { passwordResetToken: null });
  }

  async _logActivity(entityType, entityId, action, performedBy) {
    await activityLogRepository.create(
      createActivityLogEntity({
        activityId: generateActivityId(),
        entityType,
        entityId,
        action,
        performedBy,
        createdAt: nowISO(),
      }),
    );
  }
}

module.exports = new AuthService();
