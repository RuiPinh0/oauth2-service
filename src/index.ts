import express from "express";
import "dotenv/config";
import { setAuthRoutes } from "./routes/authRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

// Add middleware to parse only x-www-form-urlencoded bodies
app.use(express.urlencoded({ extended: true }));

setAuthRoutes(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export { app }; // Export the app for testing purposes
