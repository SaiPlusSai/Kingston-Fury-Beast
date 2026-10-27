const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../src/aws/clients');
const { env } = require('../src/config/env');
const { hashPassword } = require('../src/utils/password');

async function seedUsers() {
  console.log('=======================================================');
  console.log('UrbanShield - Precarga de Usuarios Demo');
  console.log(`Tabla Destino: ${env.dynamodb.usersTable}`);
  console.log('=======================================================\n');

  const docClient = getDynamoDbDocClient();
  const now = new Date().toISOString();

  const demoUsers = [
    {
      userId: 'usr-admin-demo-01',
      name: 'Alan Administrador',
      email: 'admin@halo.com',
      password: await hashPassword('Admin1234!'),
      role: 'admin',
      phone: '+591 70000001',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      userId: 'usr-citizen-demo-01',
      name: 'Ciudadano La Paz',
      email: 'ciudadano@halo.com',
      password: await hashPassword('Ciudadano1234!'),
      role: 'citizen',
      phone: '+591 70000002',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const user of demoUsers) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: env.dynamodb.usersTable,
          Item: user,
        })
      );
      console.log(`[OK] Usuario creado: ${user.email} (${user.role.toUpperCase()})`);
    } catch (err) {
      console.error(`[ERROR] Fallo al insertar usuario ${user.email}:`, err.message);
    }
  }

  console.log('\n-------------------------------------------------------');
  console.log('Credenciales listas:');
  console.log('  1. ADMIN:     admin@halo.com     | Password: Admin1234!');
  console.log('  2. CIUDADANO: ciudadano@halo.com | Password: Ciudadano1234!');
  console.log('-------------------------------------------------------\n');
}

if (require.main === module) {
  seedUsers().catch((err) => {
    console.error('Error durante la precarga de usuarios:', err);
    process.exit(1);
  });
}

module.exports = { seedUsers };
