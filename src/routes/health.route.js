const express = require("express");

const router = express.Router();
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               success: true
 *               message: Server is healthy
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy"
  });
});

module.exports = router;