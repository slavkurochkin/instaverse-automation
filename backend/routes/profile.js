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
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * security:
 *   - BearerAuth: []
 */

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
 *         example: "1"
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user.
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json; charset=utf-8:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "1"
 *                 username:
 *                   type: string
 *                   example: "Admin User"
 *                 role:
 *                   type: string
 *                   example: "admin"
 *                 age:
 *                   type: integer
 *                   example: 37
 *                 gender:
 *                   type: string
 *                   example: "male"
 *                 bio:
 *                   type: string
 *                   example: "Hello, my name is Slav, and I like photography"
 *                 favorite_style:
 *                   type: string
 *                   example: "outdoor"
 *                 totalPosts:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: "admin@gmail.com"
 *       '400':
 *         description: User not found.
 *       '401':
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
 *                     example: "1"
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       401:
 *         description: Unauthorized access.
 */
router.get("/users", authentication, getAllProfiles);

export default router;
