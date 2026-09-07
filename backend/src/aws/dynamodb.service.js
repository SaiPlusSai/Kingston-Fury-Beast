const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('./clients');
const { AppError } = require('../errors/AppError');
const { HTTP_STATUS } = require('../constants/httpStatus');
const logger = require('../utils/logger');

/**
 * Capa de abstracción DynamoDB para repositorios.
 */
class DynamoDbService {
  constructor() {
    this.client = getDynamoDbDocClient();
  }

  async get(tableName, key) {
    try {
      const result = await this.client.send(new GetCommand({ TableName: tableName, Key: key }));
      return result.Item || null;
    } catch (error) {
      logger.error('DynamoDB get failed', { tableName, error: error.message });
      throw new AppError('Database read failed', HTTP_STATUS.SERVICE_UNAVAILABLE, 'AWS_SERVICE_ERROR');
    }
  }

  async put(tableName, item) {
    try {
      await this.client.send(new PutCommand({ TableName: tableName, Item: item }));
      return item;
    } catch (error) {
      logger.error('DynamoDB put failed', { tableName, error: error.message });
      throw new AppError('Database write failed', HTTP_STATUS.SERVICE_UNAVAILABLE, 'AWS_SERVICE_ERROR');
    }
  }

  async update(tableName, key, updateExpression, expressionAttributeValues, expressionAttributeNames = {}) {
    try {
      const result = await this.client.send(
        new UpdateCommand({
          TableName: tableName,
          Key: key,
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ExpressionAttributeNames: Object.keys(expressionAttributeNames).length
            ? expressionAttributeNames
            : undefined,
          ReturnValues: 'ALL_NEW',
        }),
      );
      return result.Attributes;
    } catch (error) {
      logger.error('DynamoDB update failed', { tableName, error: error.message });
      throw new AppError('Database update failed', HTTP_STATUS.SERVICE_UNAVAILABLE, 'AWS_SERVICE_ERROR');
    }
  }

  async delete(tableName, key) {
    try {
      await this.client.send(new DeleteCommand({ TableName: tableName, Key: key }));
    } catch (error) {
      logger.error('DynamoDB delete failed', { tableName, error: error.message });
      throw new AppError('Database delete failed', HTTP_STATUS.SERVICE_UNAVAILABLE, 'AWS_SERVICE_ERROR');
    }
  }

  async scan(tableName, options = {}) {
    try {
      const result = await this.client.send(
        new ScanCommand({
          TableName: tableName,
          ...options,
        }),
      );
      return result.Items || [];
    } catch (error) {
      logger.error('DynamoDB scan failed', { tableName, error: error.message });
      throw new AppError('Database query failed', HTTP_STATUS.SERVICE_UNAVAILABLE, 'AWS_SERVICE_ERROR');
    }
  }

  async query(tableName, options = {}) {
    try {
      const result = await this.client.send(
        new QueryCommand({
          TableName: tableName,
          ...options,
        }),
      );
      return result.Items || [];
    } catch (error) {
      logger.error('DynamoDB query failed', { tableName, error: error.message });
      throw new AppError('Database query failed', HTTP_STATUS.SERVICE_UNAVAILABLE, 'AWS_SERVICE_ERROR');
    }
  }
}

module.exports = new DynamoDbService();
