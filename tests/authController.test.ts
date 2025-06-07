import { AuthController } from "../src/controllers/authController";
import { AuthService } from "../src/services/authService";
import * as kmsUtil from "../src/utils/kms";

describe("AuthController", () => {
  let authService: AuthService;
  let controller: AuthController;
  let req: any;
  let res: any;

  beforeEach(() => {
    authService = {
      initialize: jest.fn().mockResolvedValue(undefined),
      validateScope: jest.fn().mockReturnValue(true),
      validateCredentials: jest.fn().mockReturnValue(true),
    } as any;

    controller = new AuthController(authService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should return a token for valid request", async () => {
    jest.spyOn(kmsUtil, "issueToken").mockResolvedValue("mocked.jwt.token");

    req = {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: {
        client_id: "client1",
        client_secret: "secret1",
        grant_type: "client_credentials",
        scope: "default",
      },
    };

    await controller.handleTokenRequest(req, res);

    expect(res.json).toHaveBeenCalledWith({
      access_token: "mocked.jwt.token",
      token_type: "Bearer",
      expires_in: 3600,
      scope: "default",
    });
  });

  it("should return 400 for wrong content-type", async () => {
    req = {
      headers: { "content-type": "application/json" },
      body: {},
    };

    await controller.handleTokenRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "invalid_request" }),
    );
  });

  it("should return 400 for unsupported grant_type", async () => {
    req = {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: { grant_type: "password" },
    };

    await controller.handleTokenRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "invalid_request" }),
    );
  });

  it("should return 401 for invalid scope", async () => {
    (authService.validateScope as jest.Mock).mockReturnValue(false);

    req = {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: {
        client_id: "client1",
        client_secret: "secret1",
        grant_type: "client_credentials",
        scope: "invalid",
      },
    };

    await controller.handleTokenRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "invalid_request" }),
    );
  });

  it("should return 401 for invalid credentials", async () => {
    (authService.validateCredentials as jest.Mock).mockReturnValue(false);

    req = {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: {
        client_id: "client1",
        client_secret: "wrong",
        grant_type: "client_credentials",
        scope: "default",
      },
    };

    await controller.handleTokenRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "invalid_request" }),
    );
  });

  it("should return 500 for unexpected errors", async () => {
    (authService.initialize as jest.Mock).mockRejectedValue(
      new Error("Unexpected"),
    );

    req = {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: {
        client_id: "client1",
        client_secret: "secret1",
        grant_type: "client_credentials",
        scope: "default",
      },
    };

    await controller.handleTokenRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "server_error" }),
    );
  });
});
