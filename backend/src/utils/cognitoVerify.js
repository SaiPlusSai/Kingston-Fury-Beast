const { CognitoJwtVerifier } = require('aws-jwt-verify');
const { awsInfrastructure } = require('../config/aws');

let verifier = null;

if (awsInfrastructure.cognito.useCognito && awsInfrastructure.cognito.userPoolId && awsInfrastructure.cognito.clientId) {
  verifier = CognitoJwtVerifier.create({
    userPoolId: awsInfrastructure.cognito.userPoolId,
    tokenUse: "id",
    clientId: awsInfrastructure.cognito.clientId,
  });
}

const verifyCognitoToken = async (token) => {
  if (!verifier) {
    throw new Error('Cognito integration is not configured correctly');
  }
  return await verifier.verify(token);
};

module.exports = {
  verifyCognitoToken,
};
