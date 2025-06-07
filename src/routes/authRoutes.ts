import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { AuthService } from "../services/authService";

const authController = new AuthController(new AuthService());

export function setAuthRoutes(app: Router) {
  app.post("/oauth/token", (req, res) =>
    authController.handleTokenRequest(req, res),
  );
}
