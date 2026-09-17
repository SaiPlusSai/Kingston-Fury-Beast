const BaseRepository = require('./base.repository');
const { tableNames } = require('../config/database');

class UserRepository extends BaseRepository {
  constructor() {
    super(tableNames.users);
  }

  async findById(userId) {
    return this.findByIdKey('userId', userId);
  }

  async findByIdKey(idKey, idValue) {
    return super.findById(idKey, idValue);
  }

  async findByEmail(email) {
    const normalizedEmail = email.toLowerCase();
    const items = await require('../aws/dynamodb.service').query(this.tableName, {
      IndexName: 'GSI_Email',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': normalizedEmail },
    });
    return items[0] || null;
  }

  async create(user) {
    return this.save(user);
  }

  async update(userId, updates) {
    const existing = await this.findById(userId);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    return this.save(updated);
  }
}

module.exports = new UserRepository();
