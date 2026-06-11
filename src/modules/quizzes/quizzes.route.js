const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../../middleware/auth.middleware");
const { validate, schemas } = require("../../middleware/validate.middleware");
const { getAllQuizzes, getQuizById, createQuiz, updateQuiz, deleteQuiz, assignQuizToUsers, getAvailableQuizzes } = require("./quizzes.controller");

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 */
router.get("/", auth, authorize("ADMIN", "SUPER_ADMIN"), getAllQuizzes);

/**
 * @swagger
 * /api/quizzes/available:
 *   get:
 *     summary: Get available quizzes for current user
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available quizzes retrieved successfully
 */
router.get("/available", auth, getAvailableQuizzes);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *       404:
 *         description: Quiz not found
 */
router.get("/:id", auth, getQuizById);

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: number
 *               passPercentage:
 *                 type: number
 *               maxMarks:
 *                 type: number
 *               questions:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", auth, authorize("ADMIN", "SUPER_ADMIN"), validate(schemas.createQuiz), createQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       404:
 *         description: Quiz not found
 */
router.put("/:id", auth, authorize("ADMIN", "SUPER_ADMIN"), updateQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       404:
 *         description: Quiz not found
 */
router.delete("/:id", auth, authorize("ADMIN", "SUPER_ADMIN"), deleteQuiz);

/**
 * @swagger
 * /api/quizzes/{id}/assign:
 *   post:
 *     summary: Assign quiz to users
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Quiz assigned successfully
 *       404:
 *         description: Quiz not found
 */
router.post("/:id/assign", auth, authorize("ADMIN", "SUPER_ADMIN"), assignQuizToUsers);

module.exports = router;
