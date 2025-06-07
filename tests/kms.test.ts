import { issueToken } from "../src/utils/kms";

jest.mock("@aws-sdk/client-kms", () => {
  return {
    KMSClient: jest.fn().mockImplementation(() => ({
      send: jest
        .fn()
        .mockResolvedValue({
          Signature: Buffer.from("signed").toString("base64url"),
        }),
    })),
    SignCommand: jest.fn(),
  };
});

describe("issueToken", () => {
  beforeAll(() => {
    process.env.KMS_KEY_ID = "test-key-id";
    process.env.AWS_SM_ENDPOINT = "http://localhost:4566";
    process.env.AWS_REGION = "us-east-1";
    process.env.AWS_ACCESS_KEY_ID = "test";
    process.env.AWS_SECRET_ACCESS_KEY = "test";
  });

  it("should return a JWT-like string", async () => {
    const token = await issueToken("demo-client", "default");
    expect(token.split(".").length).toBe(3);
  });

  it("should throw if KMS_KEY_ID is not set", async () => {
    delete process.env.KMS_KEY_ID;
    await expect(issueToken("demo-client", "default")).rejects.toThrow(
      "KMS_KEY_ID environment variable is not set.",
    );
  });
});
