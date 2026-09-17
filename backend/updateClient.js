require('dotenv').config();
const { CognitoIdentityProviderClient, DescribeUserPoolClientCommand, UpdateUserPoolClientCommand } = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });

async function updateClient() {
  try {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const clientId = process.env.COGNITO_CLIENT_ID;
    
    console.log(`Buscando info del Client ID: ${clientId} en User Pool: ${userPoolId}`);
    
    const describeCmd = new DescribeUserPoolClientCommand({
      UserPoolId: userPoolId,
      ClientId: clientId
    });
    
    const { UserPoolClient } = await client.send(describeCmd);
    
    const flows = new Set(UserPoolClient.ExplicitAuthFlows || []);
    flows.add('ALLOW_USER_PASSWORD_AUTH');
    flows.add('ALLOW_ADMIN_USER_PASSWORD_AUTH');
    flows.add('ALLOW_REFRESH_TOKEN_AUTH');
    flows.add('ALLOW_USER_SRP_AUTH');

    const updateCmd = new UpdateUserPoolClientCommand({
      UserPoolId: userPoolId,
      ClientId: clientId,
      ClientName: UserPoolClient.ClientName,
      ExplicitAuthFlows: Array.from(flows),
      TokenValidityUnits: UserPoolClient.TokenValidityUnits,
      RefreshTokenValidity: UserPoolClient.RefreshTokenValidity,
      AccessTokenValidity: UserPoolClient.AccessTokenValidity,
      IdTokenValidity: UserPoolClient.IdTokenValidity,
      PreventUserExistenceErrors: UserPoolClient.PreventUserExistenceErrors,
      SupportedIdentityProviders: UserPoolClient.SupportedIdentityProviders,
      CallbackURLs: UserPoolClient.CallbackURLs,
      LogoutURLs: UserPoolClient.LogoutURLs,
      AllowedOAuthFlows: UserPoolClient.AllowedOAuthFlows,
      AllowedOAuthScopes: UserPoolClient.AllowedOAuthScopes,
      AllowedOAuthFlowsUserPoolClient: UserPoolClient.AllowedOAuthFlowsUserPoolClient,
    });

    await client.send(updateCmd);
    console.log("Exito: Flujos de autenticacion actualizados. ADMIN_NO_SRP_AUTH y USER_PASSWORD_AUTH estan habilitados.");
  } catch (error) {
    console.error("Error actualizando app client:", error);
  }
}

updateClient();
