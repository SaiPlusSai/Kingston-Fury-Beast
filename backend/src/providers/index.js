/**
 * Registro centralizado de proveedores externos (AWS, email, etc.)
 */
const s3Service = require('../aws/s3.service');
const dynamoDbService = require('../aws/dynamodb.service');
const snsService = require('../aws/sns.service');
const cognitoService = require('../aws/cognito.service');
const locationService = require('../aws/location.service');

module.exports = {
  s3: s3Service,
  dynamodb: dynamoDbService,
  sns: snsService,
  cognito: cognitoService,
  location: locationService,
};
