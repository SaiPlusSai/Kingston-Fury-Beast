const toPublicUser = (user) => {
  if (!user) return null;
  const {
    password,
    refreshToken,
    passwordResetToken,
    ...publicUser
  } = user;
  
  if (publicUser.trustScore === undefined) {
    publicUser.trustScore = 50;
  }
  
  return publicUser;
};

const createUserEntity = ({
  userId,
  email,
  password,
  name,
  role,
  phone = null,
  avatarKey = null,
  avatarUrl = null,
  isActive = true,
  trustScore = 50,
  createdAt,
  updatedAt,
}) => ({
  userId,
  email: email.toLowerCase(),
  password,
  name,
  role,
  phone,
  avatarKey,
  avatarUrl,
  isActive,
  trustScore,
  createdAt,
  updatedAt,
});

module.exports = {
  toPublicUser,
  createUserEntity,
};
