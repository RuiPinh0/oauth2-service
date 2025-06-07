export interface TokenRequest {
    clientId: string;
    clientSecret: string;
    grantType: string;
    scope: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}