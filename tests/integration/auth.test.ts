import request from "supertest";
import { app } from "../../src/index";

jest.mock("@aws-sdk/client-kms", () => ({
  KMSClient: jest.fn().mockImplementation(() => ({
    send: jest
      .fn()
      .mockResolvedValue({
        Signature: Buffer.from("signed").toString("base64url"),
      }),
  })),
  SignCommand: jest.fn(),
}));

jest.mock("@aws-sdk/client-secrets-manager", () => {
  return {
    SecretsManagerClient: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockImplementation((command) => {
        return Promise.resolve({
          SecretString: JSON.stringify({
            "demo-client": { secret: "demo-secret", scopes: ["default"] },
          }),
        });
      }),
    })),
    GetSecretValueCommand: jest.fn(),
  };
});

beforeAll(() => {
  process.env.KMS_KEY_ID = "test-key-id";
  process.env.AWS_SM_ENDPOINT = "http://localhost:4566";
  process.env.AWS_REGION = "us-east-1";
  process.env.AWS_ACCESS_KEY_ID = "test";
  process.env.AWS_SECRET_ACCESS_KEY = "test";
  process.env.OAUTH_SECRET_ID = "oauth/credentials";
});

describe("OAuth2 /oauth/token endpoint", () => {
  it("should return a token for valid credentials", async () => {
    const response = await request(app)
      .post("/oauth/token")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(
        "grant_type=client_credentials&client_id=demo-client&client_secret=demo-secret&scope=default",
      );
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("access_token");
    expect(response.body).toHaveProperty("token_type", "Bearer");
    expect(response.body).toHaveProperty("expires_in", 3600);
    expect(response.body).toHaveProperty("scope", "default");
  });

  it("should return 401 for invalid credentials", async () => {
    const response = await request(app)
      .post("/oauth/token")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(
        "grant_type=client_credentials&client_id=wrong&client_secret=wrong",
      );
    console.log(response.body);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "invalid_request");
  });

  it("should return 400 for missing grant_type", async () => {
    const response = await request(app)
      .post("/oauth/token")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("client_id=demo-client&client_secret=demo-secret");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "invalid_request");
  });

  it("should return 400 for unsupported grant_type", async () => {
    const response = await request(app)
      .post("/oauth/token")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send(
        "grant_type=password&client_id=demo-client&client_secret=demo-secret",
      );

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "invalid_request");
  });

  it("should return 400 for wrong content-type", async () => {
    const response = await request(app)
      .post("/oauth/token")
      .set("Content-Type", "application/json")
      .send({
        grant_type: "client_credentials",
        client_id: "demo-client",
        client_secret: "demo-secret",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error", "invalid_request");
  });
});
