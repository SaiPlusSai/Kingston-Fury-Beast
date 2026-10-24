#!/bin/bash
echo "Inicializando recursos AWS en LocalStack para UrbanShield HALO..."

awslocal dynamodb create-table \
    --table-name UrbanShield-Users-dev \
    --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S \
    --key-schema AttributeName=userId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST || true

awslocal dynamodb create-table \
    --table-name UrbanShield-Reports-dev \
    --attribute-definitions AttributeName=reportId,AttributeType=S \
    --key-schema AttributeName=reportId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST || true

awslocal dynamodb create-table \
    --table-name UrbanShield-WebSocketConnections-dev \
    --attribute-definitions AttributeName=connectionId,AttributeType=S AttributeName=userId,AttributeType=S \
    --key-schema AttributeName=connectionId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST || true

awslocal dynamodb create-table \
    --table-name UrbanShield-ChatSessions-dev \
    --attribute-definitions AttributeName=sessionId,AttributeType=S AttributeName=userId,AttributeType=S \
    --key-schema AttributeName=sessionId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST || true

awslocal dynamodb create-table \
    --table-name UrbanShield-ChatFaqs-dev \
    --attribute-definitions AttributeName=faqId,AttributeType=S AttributeName=category,AttributeType=S \
    --key-schema AttributeName=faqId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST || true

awslocal s3 mb s3://urbanshield-uploads-dev-local || true
awslocal s3 mb s3://urbanshield-prediction-cache-local || true

echo "Recursos inicializados con exito en LocalStack."

