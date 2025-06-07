import { AuthService } from "../src/services/authService";

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(async () => {
    authService = new AuthService();
    // Mock valid credentials for testing
    (authService as any).validCredentials = {
      "demo-client": { secret: "demo-secret", scopes: ["default"] },
    };
  });

  it("should validate correct credentials", () => {
    expect(authService.validateCredentials("demo-client", "demo-secret")).toBe(
      true,
    );
  });

  it("should not validate incorrect credentials", () => {
    expect(authService.validateCredentials("demo-client", "wrong")).toBe(false);
    expect(authService.validateCredentials("wrong", "demo-secret")).toBe(false);
  });

  it("should validate default scope", () => {
    expect(authService.validateScope("demo-client", "default")).toBe(true);
    expect(authService.validateScope("demo-client", "")).toBe(true);
    expect(authService.validateScope("demo-client", null as any)).toBe(true);
  });

  it("should not validate invalid scope", () => {
    expect(authService.validateScope("demo-client", "admin")).toBe(false);
    expect(authService.validateScope("wrong", "default")).toBe(false);
  });
});
