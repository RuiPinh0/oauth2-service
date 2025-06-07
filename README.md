# OAuth2 Service (Prototype)

## Overview

A Node.js (TypeScript) backend service that issues OAuth2-compatible tokens using the Client Credentials Grant (RFC 6749). Deployable to AWS Lambda (API Gateway) or EC2. Token signing uses AWS KMS if configured, otherwise a local secret.

## Setup
### Make sure you have Docker installed on you local machine

1. Start LocalStack:
   ```
   npm run localstack:start
   ```

2. Initialize services:
   ```
   npm run localstack:setup
   ```

3. Verify setup:
   ```
   aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets
   ```

### Otherwise run locally like:

1. Clone the repo and install dependencies:
   ```
   npm install
   ```

2. Run locally (EC2 mode):
   ```
   npm run build
   npm start
   ```

3. Run tests:
   ```
   npm test
   ```



{
  "client1": { "secret": "secret1", "scopes": ["default"] },
  "client2": { "secret": "secret2", "scopes": ["default"] }
}


## Deployment

- **Lambda:** Package and deploy using `cloudformation/lambda-template.yaml`.
- **EC2:** Launch using `cloudformation/ec2-template.yaml`.

## Shortcuts

- KMS signing is stubbed for local/dev.
- Credentials are hardcoded for demo.
- Scope is allowed to be null or "default" any other value is forbiden 
- Minimal error handling.
- No HTTPS, no production hardening.
- Only basic token issuance tested.
- No other optional endpoints like "/introspect" or "/revoke" implemented