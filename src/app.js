const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../swagger/swagger");
const errorHandler = require("./middleware/error.middleware");

const healthRoute = require("./routes/health.route");
const authRoute = require("./modules/auth/auth.route");
const usersRoute = require("./modules/users/users.route");
const questionsRoute = require("./modules/questions/questions.route");
const quizzesRoute = require("./modules/quizzes/quizzes.route");
const attemptsRoute = require("./modules/attempts/attempts.route");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/health", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/questions", questionsRoute);
app.use("/api/quizzes", quizzesRoute);
app.use("/api/attempts", attemptsRoute);

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
