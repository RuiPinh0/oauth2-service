# OAuth2 Service (Prototype)

## Overview

A Node.js (TypeScript) backend service that issues OAuth2-compatible tokens using the Client Credentials Grant (RFC 6749). Deployable to AWS Lambda (API Gateway) or EC2. Token signing uses AWS KMS if configured, otherwise a local secret.

## Setup
### start creating you AWS LocalStack instance

1. Clone the repo and install dependencies:
   ```
   git clone https://github.com/RuiPinh0/oauth2-service.git
   ```

2. Initialize all components with docker:
   ```
   npm run localstack:start
   ```

3. In case of restarting a new LocalStack instance and consequentially a new KMS KeyId is generated,you MUST run 'setup' and re-build the oauth-app and re-run previous command like:
   ```
   docker-compose up setup
   docker-compose build oauth2-app
   npm run localstack:setup
   ```

3. Verify EC2 is running:
   ```
   aws ec2 --endpoint-url=http://localhost:4566 describe-instances
   ```

### Test the project 

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


## Deployment
- **EC2:** Launch using `cloudformation/ec2.yaml`.

## Shortcuts

- KMS signing is stubbed for local/dev.
- Credentials are hardcoded for demo.
- Scope is allowed to be null or "default" any other value is forbiden 
- Minimal error handling.
- No HTTPS, no production hardening.
- Only basic token issuance tested.
- No other optional endpoints like "/introspect" or "/revoke" implemented