import { Router } from "express";
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const db =
  process.env.DB_ENABLED === "true"
    ? await import("../controllers/db/stories.js")
    : await import("../controllers/no-db/stories.js");

const {
  getStories,
  getUserStories,
  createStory,
  updateStory,
  deleteStory,
  likeStory,
  getStoriesByTag,
  getAllTags,
  commentOnStory,
  deleteComment,
  deleteUserStories,
  deleteUserComments,
} = db;

const router = Router();
import authentication from "../midlewares/authentication.js";

/**
 * @openapi
 * /stories:
 *   get:
 *     summary: Get all stories.
 *     tags:
 *       - Stories
 *     responses:
 *       200:
 *         description: List of all stories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error.
 */
router.get("/", getStories);

/**
 * @openapi
 * /stories/user/{userId}:
 *   get:
 *     summary: Get all stories of a specific user.
 *     tags:
 *       - Stories
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user.
 *     responses:
 *       200:
 *         description: User's stories retrieved successfully.
 *       404:
 *         description: User or stories not found.
 */
router.get("/user/:userId", getUserStories);

/**
 * @openapi
 * /stories/tags:
 *   get:
 *     summary: Get stories filtered by tag.
 *     tags:
 *       - Stories
 *     responses:
 *       200:
 *         description: Stories retrieved successfully.
 *       400:
 *         description: Invalid tag provided.
 */
router.get("/tags", getStoriesByTag);

/**
 * @openapi
 * /stories/alltags:
 *   get:
 *     summary: Get all unique tags.
 *     tags:
 *       - Stories
 *     responses:
 *       200:
 *         description: List of all tags retrieved successfully.
 *       500:
 *         description: Server error.
 */
router.get("/alltags", getAllTags);

/**
 * @openapi
 * /stories:
 *   post:
 *     summary: Create a new story.
 *     tags:
 *      - Stories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Story created successfully.
 *       401:
 *         description: Unauthorized access.
 */
router.post("/", authentication, createStory);

/**
 * @openapi
 * /stories/{id}:
 *   patch:
 *     summary: Update a specific story by ID.
 *     tags:
 *      - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the story to update.
 *     responses:
 *       200:
 *         description: Story updated successfully.
 *       404:
 *         description: Story not found.
 *       401:
 *         description: Unauthorized access.
 */
router.patch("/:id", authentication, updateStory);

/**
 * @openapi
 * /stories/{id}:
 *   delete:
 *     summary: Delete a specific story by ID.
 *     tags:
 *      - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the story to delete.
 *     responses:
 *       200:
 *         description: Story deleted successfully.
 *       404:
 *         description: Story not found.
 *       401:
 *         description: Unauthorized access.
 */
router.delete("/:id", authentication, deleteStory);

/**
 * @openapi
 * /stories/{id}/likeStory:
 *   patch:
 *     summary: Like or unlike a specific story by ID.
 *     tags:
 *      - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the story to like.
 *     responses:
 *       200:
 *         description: Story liked/unliked successfully.
 *       404:
 *         description: Story not found.
 *       401:
 *         description: Unauthorized access.
 */
router.patch("/:id/likeStory", authentication, likeStory);

/**
 * @openapi
 * /stories/{id}/comment:
 *   post:
 *     summary: Add a comment to a specific story by ID.
 *     tags:
 *      - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the story to comment on.
 *     responses:
 *       201:
 *         description: Comment added successfully.
 *       404:
 *         description: Story not found.
 *       401:
 *         description: Unauthorized access.
 */
router.post("/:id/comment", authentication, commentOnStory);

/**
 * @openapi
 * /stories/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete a specific comment on a story by comment ID.
 *     tags:
 *      - Stories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the story.
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the comment to delete.
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
 *       404:
 *         description: Story or comment not found.
 *       401:
 *         description: Unauthorized access.
 */
router.delete("/:id/comments/:commentId", authentication, deleteComment);

/**
 * @openapi
 * /stories/user/{userId}:
 *   delete:
 *     summary: Delete all stories of a specific user by userId.
 *     tags:
 *      - Stories
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
 *         description: User's stories deleted successfully.
 *       404:
 *         description: User or stories not found.
 *       401:
 *         description: Unauthorized access.
 */
router.delete("/user/:userId", authentication, deleteUserStories);

/**
 * @openapi
 * /stories/comments/user/{userId}:
 *   delete:
 *     summary: Delete all comments of a specific user by userId.
 *     tags:
 *      - Stories
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
 *         description: User's comments deleted successfully.
 *       404:
 *         description: User or comments not found.
 *       401:
 *         description: Unauthorized access.
 */
router.delete("/comments/user/:userId", authentication, deleteUserComments);

export default router;
