import { KMSClient, SignCommand } from "@aws-sdk/client-kms";

export async function issueToken(
  clientId: string,
  scope: string,
): Promise<string> {
  // Prepare JWT header and payload
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: process.env.KMS_KEY_ID,
  };
  const payload = { sub: clientId, scope: scope };
  // Initialize KMS client
  const kms = new KMSClient({
    endpoint: process.env.AWS_SM_ENDPOINT,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
  if (!process.env.KMS_KEY_ID) {
    throw new Error("KMS_KEY_ID environment variable is not set.");
  }

  // Encode header and payload to base64url
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url",
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const message = `${encodedHeader}.${encodedPayload}`;

  // Sign the message (header.payload) with KMS
  const signResult = await kms.send(
    new SignCommand({
      KeyId: process.env.KMS_KEY_ID!,
      Message: Buffer.from(message),
      MessageType: "RAW",
      SigningAlgorithm: "RSASSA_PKCS1_V1_5_SHA_256",
    }),
  );
  const signature = Buffer.from(signResult.Signature!).toString("base64url");
  return `${message}.${signature}`;
}
