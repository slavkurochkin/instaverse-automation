import { Router } from "express";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const db =
  process.env.DB_ENABLED === "true"
    ? await import("../controllers/db/profile.js")
    : await import("../controllers/no-db/profile.js");

const { getProfile, getUserProfile, getAllProfiles, uploadProfileImage } = db;

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

/**
 * @openapi
 * /profile/upload-image:
 *   post:
 *     summary: Upload profile image for the authenticated user.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 description: Base64 encoded image data
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 avatar:
 *                   type: string
 *       400:
 *         description: Invalid image format.
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal server error.
 */
router.post("/upload-image", authentication, uploadProfileImage);

export default router;
