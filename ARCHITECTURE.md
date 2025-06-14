# Architecture

- **API**: `/token` endpoint for OAuth2 Client Credentials Grant.
- **Compute**: Deployable as EC2 (Express).
- **Token**: JWT, signed with AWS KMS.
- **IaC**: AWS CloudFormation templates for KMS, Secre Manager and EC2. And some scripts to Setup them.
- **Testing**: Minimal unit tests for token issuance.

## Design Principles

This project follows **Separation of Concerns** and the **KISS** principles:

- Controller, service, and utility layers are clearly separated.
- Each module has a single responsibility.
- Logic is kept straightforward and easy to maintain.
- Error handling and validation are modularized for clarity.

## Flow

1. Client POSTs to `/token` with credentials.
2. Service validates credentials.
3. Service issues JWT access token (signed with KMS or local secret).
4. Token returned in OAuth2-compatible format.
