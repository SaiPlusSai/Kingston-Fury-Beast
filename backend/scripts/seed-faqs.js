const fs = require('fs');
const path = require('path');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../src/aws/clients');
const { env } = require('../src/config/env');

const SEED_FILE = path.resolve(__dirname, '../data/faqs_seed.json');

async function seedFaqs() {
  console.log('=======================================================');
  console.log('UrbanShield - Precarga Inicial de FAQs (DATA-04)');
  console.log(`Tabla Destino: ${env.dynamodb.chatFaqsTable}`);
  console.log('=======================================================\n');

  if (!fs.existsSync(SEED_FILE)) {
    console.error(`Error: Archivo de seed no encontrado en ${SEED_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(SEED_FILE, 'utf-8');
  const faqs = JSON.parse(rawData);
  const docClient = getDynamoDbDocClient();

  const now = new Date().toISOString();
  let count = 0;

  for (const faq of faqs) {
    const item = {
      ...faq,
      createdAt: faq.createdAt || now,
      updatedAt: now,
    };

    try {
      await docClient.send(
        new PutCommand({
          TableName: env.dynamodb.chatFaqsTable,
          Item: item,
        })
      );
      count++;
      console.log(`[OK] FAQ insertada: [${item.faqId}] - ${item.question}`);
    } catch (err) {
      console.error(`[ERROR] Fallo al insertar FAQ [${item.faqId}]:`, err.message);
    }
  }

  console.log('\n-------------------------------------------------------');
  console.log(`Proceso finalizado: ${count}/${faqs.length} FAQs sembradas exitosamente.`);
  console.log('-------------------------------------------------------\n');
}

if (require.main === module) {
  seedFaqs().catch(err => {
    console.error('Error fatal durante la precarga:', err);
    process.exit(1);
  });
}

module.exports = { seedFaqs };
