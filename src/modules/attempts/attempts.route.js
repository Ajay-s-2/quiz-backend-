const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../../middleware/auth.middleware");
const { validate, schemas } = require("../../middleware/validate.middleware");
const { startAttempt, submitAttempt, getAttemptById, getUserAttempts, getQuizAttempts, getLeaderboard } = require("./attempts.controller");

/**
 * @swagger
 * /api/attempts/quiz/{quizId}/start:
 *   post:
 *     summary: Start a quiz attempt
 *     tags: [Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Quiz started successfully
 *       400:
 *         description: Quiz not available or already completed
 *       404:
 *         description: Quiz not found
 */
router.post("/quiz/:quizId/start", auth, startAttempt);

/**
 * @swagger
 * /api/attempts/{attemptId}/submit:
 *   post:
 *     summary: Submit a quiz attempt
 *     tags: [Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answers:
 *                 type: object
 *               timeTaken:
 *                 type: number
 *     responses:
 *       200:
 *         description: Attempt submitted successfully
 *       400:
 *         description: Invalid attempt data
 *       404:
 *         description: Attempt not found
 */
router.post("/:attemptId/submit", auth, validate(schemas.submitAttempt), submitAttempt);

/**
 * @swagger
 * /api/attempts/user:
 *   get:
 *     summary: Get current user's attempts
 *     tags: [Attempts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User attempts retrieved successfully
 */
router.get("/user", auth, getUserAttempts);

/**
 * @swagger
 * /api/attempts/{attemptId}:
 *   get:
 *     summary: Get attempt by ID
 *     tags: [Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attempt retrieved successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Attempt not found
 */
router.get("/:attemptId", auth, getAttemptById);

/**
 * @swagger
 * /api/attempts/quiz/{quizId}:
 *   get:
 *     summary: Get all attempts for a quiz
 *     tags: [Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz attempts retrieved successfully
 */
router.get("/quiz/:quizId", auth, authorize("ADMIN", "SUPER_ADMIN"), getQuizAttempts);

/**
 * @swagger
 * /api/attempts/quiz/{quizId}/leaderboard:
 *   get:
 *     summary: Get leaderboard for a quiz
 *     tags: [Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get("/quiz/:quizId/leaderboard", auth, getLeaderboard);

module.exports = router;
