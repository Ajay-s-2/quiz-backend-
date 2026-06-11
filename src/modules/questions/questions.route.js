const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../../middleware/auth.middleware");
const { validate, schemas } = require("../../middleware/validate.middleware");
const { getAllQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion } = require("./questions.controller");

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Questions retrieved successfully
 */
router.get("/", auth, getAllQuestions);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     tags: [Questions]
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
 *         description: Question retrieved successfully
 *       404:
 *         description: Question not found
 */
router.get("/:id", auth, getQuestionById);

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               section:
 *                 type: string
 *               type:
 *                 type: string
 *               prompt:
 *                 type: string
 *               topic:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               difficulty:
 *                 type: string
 *               marks:
 *                 type: number
 *               negativeMarks:
 *                 type: number
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               answer:
 *                 type: object
 *               explanation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", auth, authorize("ADMIN", "SUPER_ADMIN"), validate(schemas.createQuestion), createQuestion);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update question
 *     tags: [Questions]
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
 *         description: Question updated successfully
 *       404:
 *         description: Question not found
 */
router.put("/:id", auth, authorize("ADMIN", "SUPER_ADMIN"), updateQuestion);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete question
 *     tags: [Questions]
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
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 */
router.delete("/:id", auth, authorize("ADMIN", "SUPER_ADMIN"), deleteQuestion);

module.exports = router;
