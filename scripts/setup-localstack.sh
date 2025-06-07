#!/bin/bash

# Wait for LocalStack to be ready
echo "Waiting for LocalStack to be ready..."
aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets >/dev/null 2>&1
while [ $? -ne 0 ]; do
    sleep 2
    aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets >/dev/null 2>&1
done

# Deploy KMS key
aws --endpoint-url=http://localhost:4566 cloudformation create-stack --stack-name oauth-kms --template-body file://cloudformation/kms.yaml

# Deploy Secrets Manager secret
aws --endpoint-url=http://localhost:4566 cloudformation create-stack --stack-name oauth-secrets --template-body file://cloudformation/secrets.yaml

# Deploy EC2 instance
aws --endpoint-url=http://localhost:4566 cloudformation create-stack --stack-name oauth-ec2 --template-body file://cloudformation/ec2.yaml