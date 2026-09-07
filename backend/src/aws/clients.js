const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { S3Client } = require('@aws-sdk/client-s3');
const { SNSClient } = require('@aws-sdk/client-sns');
const {
  CognitoIdentityProviderClient,
} = require('@aws-sdk/client-cognito-identity-provider');
const { LocationClient } = require('@aws-sdk/client-location');
const { getAwsClientConfig, getDynamoDbClientConfig } = require('../config/aws');

let dynamoDbClient = null;
let dynamoDbDocClient = null;
let s3Client = null;
let snsClient = null;
let cognitoClient = null;
let locationClient = null;

const getDynamoDbClient = () => {
  if (!dynamoDbClient) {
    dynamoDbClient = new DynamoDBClient(getDynamoDbClientConfig());
  }
  return dynamoDbClient;
};

const getDynamoDbDocClient = () => {
  if (!dynamoDbDocClient) {
    dynamoDbDocClient = DynamoDBDocumentClient.from(getDynamoDbClient(), {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return dynamoDbDocClient;
};

const getS3Client = () => {
  if (!s3Client) s3Client = new S3Client(getAwsClientConfig());
  return s3Client;
};

const getSnsClient = () => {
  if (!snsClient) snsClient = new SNSClient(getAwsClientConfig());
  return snsClient;
};

const getCognitoClient = () => {
  if (!cognitoClient) cognitoClient = new CognitoIdentityProviderClient(getAwsClientConfig());
  return cognitoClient;
};

const getLocationClient = () => {
  if (!locationClient) locationClient = new LocationClient(getAwsClientConfig());
  return locationClient;
};

module.exports = {
  getDynamoDbClient,
  getDynamoDbDocClient,
  getS3Client,
  getSnsClient,
  getCognitoClient,
  getLocationClient,
};
