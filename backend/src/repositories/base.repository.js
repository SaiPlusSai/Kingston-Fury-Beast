const dynamoDbService = require('../aws/dynamodb.service');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findById(idKey, idValue) {
    return dynamoDbService.get(this.tableName, { [idKey]: idValue });
  }

  async save(item) {
    return dynamoDbService.put(this.tableName, item);
  }

  async remove(idKey, idValue) {
    return dynamoDbService.delete(this.tableName, { [idKey]: idValue });
  }

  async findAll() {
    return dynamoDbService.scan(this.tableName);
  }
}

module.exports = BaseRepository;
