import { InternalServerError, ValidationError } from '../utils/errors';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

type ClientCredentials = {
    [clientId: string]: {
        secret: string;
        scopes: string[];
    };
};

// Service to handle OAuth2 authentication
// This service validates client credentials and scopes.
// It can be extended to include more complex logic such as database lookups or external service calls.
export class AuthService {
    private validCredentials!: ClientCredentials;
    private secretsManager: SecretsManagerClient;

    constructor() {
        this.secretsManager =  new SecretsManagerClient({
            endpoint: process.env.AWS_SM_ENDPOINT,
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
            }
        });
    }

    async initialize() {
        try {
            const secretId = process.env.OAUTH_SECRET_ID;
            if (!secretId) {
                // This shouldn't be returned in production, but we keep this message for debugging purposes
                throw new InternalServerError('OAUTH_SECRET_ID environment variable is not set.');
            }
            const secret = await this.secretsManager.send(
                new GetSecretValueCommand({ SecretId: process.env.OAUTH_SECRET_ID })
            );
            if (!secret.SecretString) {
                // This shouldn't be returned in production, but we keep this message for debugging purposes
                throw new InternalServerError('No secret string found in Secrets Manager.');
            }
            this.validCredentials = JSON.parse(secret.SecretString || '{}');
        } catch (err) {
            // This shouldn't be returned in production, but we keep this message for debugging purposes
            throw new InternalServerError('No credentials found in Secrets Manager. Please set up your secrets in AWS Secrets Manager.');
        }
    }

    public validateCredentials(clientId: string, clientSecret: string): boolean {

        if (!clientId || typeof clientId !== 'string') {
            throw new ValidationError('Invalid client ID');
        }
        if (!clientSecret || typeof clientSecret !== 'string') {
            throw new ValidationError('Invalid client secret');
        }
        if (!this.validCredentials || !this.validCredentials[clientId]) {
            throw new ValidationError('Invalid client credentials');
        }
        const client = this.validCredentials[clientId];
        return !!client && client.secret === clientSecret;    
    }

    public validateScope(clientId: string, scope: string | null): boolean {
        const client = this.validCredentials[clientId];
        if (!client) return false;
        // In a real implementation, this would check against allowed scopes.
        // For simplicity, only 'default' and null scope are valid.
        return scope === null || scope === '' || (scope === 'default' && client.scopes.includes('default'));
    }
}