const {
  ScanCommand,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');
const { getDynamoDbDocClient } = require('../aws/clients');
const { env } = require('../config/env');
const { AppError } = require('../utils/apiResponse');

/**
 * Service to manage FAQs in DynamoDB (ChatFaqsTable)
 */
class FaqService {
  constructor() {
    this.tableName = env.dynamodb.chatFaqsTable;
  }

  get docClient() {
    return getDynamoDbDocClient();
  }

  /**
   * List FAQs with optional category and search filters
   */
  async getFaqs({ category, search, isActive, limit = 100 } = {}) {
    const params = {
      TableName: this.tableName,
      Limit: limit,
    };

    const filterExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (category) {
      filterExpressions.push('#cat = :category');
      expressionAttributeNames['#cat'] = 'category';
      expressionAttributeValues[':category'] = category.toLowerCase();
    }

    if (isActive !== undefined) {
      filterExpressions.push('#act = :isActive');
      expressionAttributeNames['#act'] = 'isActive';
      expressionAttributeValues[':isActive'] = isActive === true || isActive === 'true';
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeNames = expressionAttributeNames;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    const result = await this.docClient.send(new ScanCommand(params));
    let items = result.Items || [];

    // Fallback: If table is empty, load seed data in-memory
    if (items.length === 0) {
      try {
        const seed = require('../../data/faqs_seed.json');
        items = seed;
      } catch (err) {
        items = [];
      }
    }

    if (search) {
      const term = search.toLowerCase();
      items = items.filter(
        (f) =>
          (f.question && f.question.toLowerCase().includes(term)) ||
          (f.answer && f.answer.toLowerCase().includes(term)) ||
          (Array.isArray(f.keywords) && f.keywords.some((k) => k.toLowerCase().includes(term)))
      );
    }

    return items;
  }

  /**
   * Get a single FAQ by its ID
   */
  async getFaqById(faqId) {
    if (!faqId) throw new AppError('faqId is required', 400);

    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { faqId },
      })
    );

    if (result.Item) return result.Item;

    // Check seed fallback
    try {
      const seed = require('../../data/faqs_seed.json');
      const found = seed.find((f) => f.faqId === faqId);
      if (found) return found;
    } catch (err) {
      // ignore
    }

    return null;
  }

  /**
   * Create a new FAQ entry
   */
  async createFaq(data) {
    const { question, answer, category, keywords, isActive = true } = data;

    if (!question || !answer || !category) {
      throw new AppError('Question, answer, and category are required fields', 400);
    }

    const faqId =
      data.faqId ||
      `faq-${category.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const normalizedKeywords = Array.isArray(keywords)
      ? keywords.map((k) => k.toLowerCase().trim()).filter(Boolean)
      : (keywords || '')
          .split(',')
          .map((k) => k.toLowerCase().trim())
          .filter(Boolean);

    const item = {
      faqId,
      question: question.trim(),
      answer: answer.trim(),
      category: category.toLowerCase().trim(),
      keywords: normalizedKeywords,
      isActive: Boolean(isActive),
      createdAt: now,
      updatedAt: now,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      })
    );

    return item;
  }

  /**
   * Update an existing FAQ entry
   */
  async updateFaq(faqId, updates) {
    const existing = await this.getFaqById(faqId);
    if (!existing) {
      throw new AppError(`FAQ with id "${faqId}" not found`, 404);
    }

    const now = new Date().toISOString();
    const updated = {
      ...existing,
      ...updates,
      faqId, // preserve PK
      updatedAt: now,
    };

    if (updates.keywords) {
      updated.keywords = Array.isArray(updates.keywords)
        ? updates.keywords.map((k) => k.toLowerCase().trim()).filter(Boolean)
        : (updates.keywords || '')
            .split(',')
            .map((k) => k.toLowerCase().trim())
            .filter(Boolean);
    }

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      })
    );

    return updated;
  }

  /**
   * Delete an FAQ entry
   */
  async deleteFaq(faqId) {
    const existing = await this.getFaqById(faqId);
    if (!existing) {
      throw new AppError(`FAQ with id "${faqId}" not found`, 404);
    }

    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { faqId },
      })
    );

    return { faqId, deleted: true };
  }
}

module.exports = new FaqService();
