const { verifyCognitoToken } = require('../utils/cognitoVerify');
const userRepository = require('../repositories/user.repository');
const { UnauthorizedError, NotFoundError } = require('../errors/AppError');
const { awsInfrastructure } = require('../config/aws');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.split(' ')[1];
    let userEmail;

    if (awsInfrastructure.cognito.useCognito) {
      try {
        const decoded = await verifyCognitoToken(token);
        userEmail = decoded.email;
      } catch (err) {
        console.error("Cognito JWT Verify Error:", err);
        throw new UnauthorizedError('Invalid token: ' + err.message);
      }
    } else {
      const { verifyAccessToken } = require('../utils/jwt');
      const decoded = verifyAccessToken(token);
      userEmail = decoded.email;
    }

    const user = await userRepository.findByEmail(userEmail);
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found or inactive');
    }

    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, res, next);
};

module.exports = {
  authenticate,
  optionalAuthenticate,
};
