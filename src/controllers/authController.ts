import { Request, Response } from 'express';
import { TokenRequest, TokenResponse } from '../models/messageModels';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import { issueToken } from '../utils/kms';
import { AuthService } from '../services/authService';

export class AuthController {
    
    constructor(private authService: AuthService) { }
    /**
    * Handles the OAuth2 token request.
    * Validates the request, issues a token if valid, or returns an error response.
    * 
    * @param req - The request object containing client credentials and grant type.
    * @param res - The response object to send the token or error response.
    */
    public async handleTokenRequest(req: Request, res: Response): Promise<void> {

        const authHeader = req.headers.authorization;
        let clientId: string | undefined;
        let clientSecret: string | undefined;

        // Extract client credentials from Authorization header if present
        // If the header is in Basic Auth format, decode it 
        if (authHeader && authHeader.startsWith('Basic ')) {
            const base64Credentials = authHeader.split(' ')[1];
            const credentials = atob(base64Credentials).split(':');
            clientId = credentials[0];
            clientSecret = credentials[1];
        }
        
        const tokenRequest: TokenRequest = {
            clientId: clientId || req.body.client_id, // Use client_id from body if not in header as per OAuth2 spec
            clientSecret: clientSecret || req.body.client_secret, // Use client_secret from body if not in header as per OAuth2 spec
            grantType: req.body.grant_type,
            scope: req.body.scope || 'default'
        };

        try {
            // Validate Content-Type header to meet OAuth2 requirements
            if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('application/x-www-form-urlencoded')) {
                throw new ValidationError('Content-Type must be application/x-www-form-urlencoded');
            }
            // Validate the token grant type
            if (tokenRequest.grantType !== 'client_credentials') {
                throw new ValidationError('unsupported_grant_type: ' + tokenRequest.grantType);
            }
            await this.authService.initialize();
            if (!this.authService.validateScope(tokenRequest.clientId, tokenRequest.scope)) {
                throw new UnauthorizedError('Invalid access scope');
            }

            if (!this.authService.validateCredentials(tokenRequest.clientId, tokenRequest.clientSecret)) {
                throw new UnauthorizedError('Invalid client credentials');
            }

            const token = await issueToken(tokenRequest.clientId, tokenRequest.scope);
            
            this.sendTokenResponse(res, token, tokenRequest.scope);
        } catch (error) {
            this.processErrorResponse(res, error);
        }
    }

    /**
     * Sends the token response in the required format.
     * 
     * @param res - The response object to send the token response.
     * @param token - The issued access token.
     * @param scope - The scope of the access token.
     */
    private sendTokenResponse(res: Response, token: string, scope: string): void {
        const tokenResponse: TokenResponse = {
            access_token: token,
            token_type: 'Bearer',
            expires_in: 3600,
            scope: scope
        };
        res.json(tokenResponse);
    }

    /**
     * Processes the error response based on the type of error.
     * 
     * @param res - The response object to send the error response.
     * @param error - The error object containing details about the error.
     */
    private processErrorResponse(res: Response, error: any){
        if (error instanceof ValidationError || error instanceof UnauthorizedError) {
                res.status(error.statusCode).json({
                    error: 'invalid_request',
                    error_description: error.message
                });
            } else {
                res.status(500).json({
                    error: 'server_error',
                    error_description: error.message
                });
            }
    }
}