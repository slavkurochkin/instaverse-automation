import { Router } from "express";
import {
  login,
  signup,
  deleteUser,
  updateUserProfile,
} from "../controlers/users.js";
import authentication from "../midlewares/authentication.js";

const router = Router();

/**
 * @openapi
 * /user/login:
 *   post:
 *     summary: Login user and return a token.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Successfully logged in, returning JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for user authentication.
 *       401:
 *         description: Invalid credentials.
 */
router.post("/login", login);

/**
 * @openapi
 * /user/signup:
 *   post:
 *     summary: Register a new user.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "John Doe"
 *               bio:
 *                 type: string
 *                 example: "Hey there!"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               confirmPassword:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User created successfully.
 *       400:
 *         description: User could not be created due to invalid input.
 */
router.post("/signup", signup);

/**
 * @openapi
 * /user/{userId}:
 *   delete:
 *     summary: Delete a user by ID.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete.
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       401:
 *         description: Unauthorized - Bearer token required.
 *       404:
 *         description: User not found.
 */
router.delete("/:userId", authentication, deleteUser);

/**
 * @openapi
 * /user/{userId}:
 *   patch:
 *     summary: Update user profile information by ID.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 example: "jane@example.com"
 *     responses:
 *       200:
 *         description: User profile updated successfully.
 *       401:
 *         description: Unauthorized - Bearer token required.
 *       404:
 *         description: User not found.
 */
router.patch("/:userId", authentication, updateUserProfile);

export default router;
