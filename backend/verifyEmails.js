require('dotenv').config();
const { CognitoIdentityProviderClient, ListUsersCommand, AdminUpdateUserAttributesCommand } = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });

async function verifyAllEmails() {
  try {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    
    console.log(`Buscando usuarios en User Pool: ${userPoolId}`);
    
    const listCmd = new ListUsersCommand({
      UserPoolId: userPoolId,
    });
    
    const response = await client.send(listCmd);
    const users = response.Users || [];

    console.log(`Se encontraron ${users.length} usuarios. Verificando correos...`);

    for (const user of users) {
      await client.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: user.Username,
          UserAttributes: [
            { Name: 'email_verified', Value: 'true' }
          ]
        })
      );
      console.log(`- Correo verificado para: ${user.Username}`);
    }

    console.log("Exito: Todos los correos de los usuarios existentes han sido marcados como verificados.");
  } catch (error) {
    console.error("Error verificando correos:", error);
  }
}

verifyAllEmails();
