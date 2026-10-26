# syntax=docker/dockerfile:1
FROM python:3.11-slim

# Metadata
LABEL maintainer="UrbanShield / HALO Team"
LABEL description="Container image for HALO Hotspot Prediction Service"

# Set working directory
WORKDIR /var/task

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc g++ make curl && \
    rm -rf /var/lib/apt/lists/*

# Install AWS Lambda Runtime Interface Client (RIC) for Lambda Container compatibility
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir awslambdaric

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy prediction code and assets
COPY src/ ./src/
COPY config/ ./config/
COPY handler.py .

# Entrypoint for Lambda or standalone docker run
ENTRYPOINT [ "/usr/local/bin/python", "-m", "awslambdaric" ]
CMD [ "handler.lambda_handler" ]
