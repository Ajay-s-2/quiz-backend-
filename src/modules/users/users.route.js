const express = require("express");
const router = express.Router();
const { auth, authorize } = require("../../middleware/auth.middleware");
const { getAllUsers, getUserById, createAdmin, bulkCreateAdmins, updateUser, updateUserStatus, resetUserPassword, exportAdmins, deleteUser, updateAverageScore } = require("./users.controller");

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get("/", auth, authorize("ADMIN", "SUPER_ADMIN"), getAllUsers);

/**
 * @swagger
 * /api/users/create-admin:
 *   post:
 *     summary: Create a new admin user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       409:
 *         description: Admin with this email already exists
 */
router.post("/create-admin", auth, authorize("SUPER_ADMIN"), createAdmin);

/**
 * @swagger
 * /api/users/bulk-create-admins:
 *   post:
 *     summary: Bulk create admin users from CSV
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               csv:
 *                 type: string
 *                 description: CSV content with Admin Name and Email Address
 *     responses:
 *       201:
 *         description: Admins created successfully
 *       400:
 *         description: Invalid CSV format
 */
router.post("/bulk-create-admins", auth, authorize("SUPER_ADMIN"), bulkCreateAdmins);

/**
 * @swagger
 * /api/users/export/{format}:
 *   get:
 *     summary: Export admin data as CSV or PDF
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [csv, pdf]
 *     responses:
 *       200:
 *         description: File exported successfully
 *       400:
 *         description: Invalid export format
 */
router.get("/export/:format", auth, authorize("SUPER_ADMIN"), exportAdmins);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/:id", auth, getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *               batch:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put("/:id", auth, authorize("ADMIN", "SUPER_ADMIN"), updateUser);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Toggle user status (active/inactive)
 *     tags: [Users]
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
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 */
router.patch("/:id/status", auth, authorize("SUPER_ADMIN"), updateUserStatus);

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   patch:
 *     summary: Reset user password
 *     tags: [Users]
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
 *         description: Password reset successfully
 *       404:
 *         description: User not found
 */
router.patch("/:id/reset-password", auth, authorize("SUPER_ADMIN"), resetUserPassword);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete("/:id", auth, authorize("ADMIN", "SUPER_ADMIN"), deleteUser);

/**
 * @swagger
 * /api/users/{id}/score:
 *   put:
 *     summary: Update user average score
 *     tags: [Users]
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
 *               averageScore:
 *                 type: number
 *               completedQuizzes:
 *                 type: number
 *     responses:
 *       200:
 *         description: User score updated successfully
 *       404:
 *         description: User not found
 */
router.put("/:id/score", auth, updateAverageScore);

module.exports = router;
