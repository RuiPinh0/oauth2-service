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

4. Test the endpoint with the following examples

    ```sh
    curl --location 'http://localhost:3000/oauth/token' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode 'grant_type=client_credentials' \
    --data-urlencode 'client_id=client1' \
    --data-urlencode 'client_secret=dummysecret1' \
    --data-urlencode 'scope=default'
    ```

or 

    ```sh
    curl --location --request POST 'http://localhost:3000/oauth/token' \
    --header 'Content-Type: application/x-www-form-urlencoded' \
    --header 'grant_type: client_credentials' \
    --header 'client_id: client1' \
    --header 'client_secret: dummysecret1'
    ```

    
## Testing

This project includes both integration and unit tests for the OAuth2 token endpoint and authentication logic.

### Run All Tests

```sh
npm test
```

### Example Tests

#### Integration Test for `/oauth/token` Endpoint

- Returns a token for valid credentials
- Returns 401 for invalid credentials
- Returns 400 for missing or unsupported grant type
- Returns 400 for wrong content-type

#### Unit Tests

- Credential and scope validation in AuthService
- Token issuance logic (with KMS mocked)

Test files are located in the `tests/` directory.


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