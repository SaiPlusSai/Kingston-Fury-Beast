require('dotenv').config();
const { CognitoIdentityProviderClient, DescribeUserPoolCommand } = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });

async function checkEmailConfig() {
  try {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const cmd = new DescribeUserPoolCommand({ UserPoolId: userPoolId });
    const { UserPool } = await client.send(cmd);
    console.log("Email Configuration:", JSON.stringify(UserPool.EmailConfiguration, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

checkEmailConfig();
