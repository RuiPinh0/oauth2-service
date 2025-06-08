#!/bin/sh

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."

# Set environment variables for LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test123supersafe
export AWS_DEFAULT_REGION=us-east-1
export AWS_SM_ENDPOINT=http://localstack:4566
export AWS_REGION=us-east-1

# Deploy KMS key
aws --endpoint-url=http://localstack:4566 cloudformation create-stack --stack-name oauth-kms --template-body file://cloudformation/kms.yaml

# Deploy Secrets Manager secret
aws --endpoint-url=http://localstack:4566 cloudformation create-stack --stack-name oauth-secrets --template-body file://cloudformation/secrets.yaml

# Deploy EC2 instance
aws --endpoint-url=http://localstack:4566 cloudformation create-stack --stack-name oauth-ec2 --template-body file://cloudformation/ec2.yaml


echo "Waiting for KMS stack to be created..."
aws --endpoint-url=http://localstack:4566 cloudformation wait stack-create-complete --stack-name oauth-kms

# Retry fetching the KMS KeyId until it's not empty
KMS_KEY_ID=""
for i in $(seq 1 10); do
  KMS_KEY_ID=$(aws --endpoint-url=http://localstack:4566 cloudformation describe-stacks --stack-name oauth-kms \
    --query "Stacks[0].Outputs[?OutputKey=='KmsKeyId'].OutputValue" --output text)
  if [ -n "$KMS_KEY_ID" ] && [ "$KMS_KEY_ID" != "None" ]; then
    break
  fi
  echo "Waiting for KMS KeyId to be available..."
  sleep 2
done

echo "KMS KeyId is $KMS_KEY_ID"

# Replace or add KMS_KEY_ID in .env file
if grep -q '^KMS_KEY_ID=' .env; then
  sed -i.bak "s|^KMS_KEY_ID=.*|KMS_KEY_ID=$KMS_KEY_ID|" .env
else
  echo "KMS_KEY_ID=$KMS_KEY_ID" >> .env
fi