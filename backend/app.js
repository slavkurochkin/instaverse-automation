// IMPORTANT: Make sure to import `instrument.js` at the top of your file.
// If you're using ECMAScript Modules (ESM) syntax, use `import "./instrument.js";`
import "./instrument.mjs";

import * as Sentry from "@sentry/node";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

import pool from "./db.js";

console.log("DB_ENABLED:", process.env.DB_ENABLED);
// Load appropriate database file based on DB_ENABLED
const db = await (process.env.DB_ENABLED === "true"
  ? import("./db/dbEnabled.js")
  : import("./db/dbDisabled.js"));

import storyRoutes from "./routes/stories.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";

const app = express();
app.use("/images", express.static(path.join(__dirname, "public/images")));

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

// Middleware to test DB connection
app.get("/test-db", async (req, res) => {
  console.log("DB_ENABLED:", process.env.DB_ENABLED);

  try {
    const result = await db.testConnection();
    res.send({ message: "Database connection success", result });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Database connection failed", details: error.message });
  }
});

// Route to Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

dotenv.config();
// console.log(process.env)
app.use(bodyParser.json({ limit: "32mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "32mb", extended: true }));
app.use(cors());

app.use("/stories", storyRoutes);
app.use("/user", userRoutes);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the instavers API");
});

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5001;

const connectDB = async () => {
  try {
    // await mongoose.connect(MONGO_URI);
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  } catch (err) {
    // console.error("Connection to MongoDB failed", err.message);
  }
};

connectDB();

mongoose.connection.on("open", () =>
  console.log("Connection to database has been established successfully")
);
mongoose.connection.on("error", (err) => console.log(err));

export default app;
