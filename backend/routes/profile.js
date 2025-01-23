import { Router } from "express";
import {
  getProfile,
  getUserProfile,
  getAllProfiles,
} from "../controllers/profile.js";
const router = Router();
import authentication from "../midlewares/authentication.js";

/**
 * @openapi
 * /profile:
 *   get:
 *     summary: Get the profile of the authenticated user.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 */
router.get("/", authentication, getProfile);

/**
 * @openapi
 * /profile/users/{userId}:
 *   get:
 *     summary: Get the profile of a specific user by userId.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: User not found.
 *       401:
 *         description: Unauthorized access.
 */
router.get("/users/:userId", authentication, getUserProfile);

/**
 * @openapi
 * /profile/users:
 *   get:
 *     summary: Get profiles of all users.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of user profiles retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       401:
 *         description: Unauthorized access.
 */
router.get("/users", authentication, getAllProfiles);

export default router;
