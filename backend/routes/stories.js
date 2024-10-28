import { Router } from "express";
import { getStories, getUserStories, createStory, updateStory, deleteStory, likeStory, getStoriesByTag, getAllTags, commentOnStory, deleteComment, deleteUserStories, deleteUserComments } from "../controlers/stories.js";
const router = Router();
import authentication from '../midlewares/authentication.js'

router.get("/", getStories);
router.get("/user/:userId", getUserStories);
router.get("/tags", getStoriesByTag);
router.get("/alltags", getAllTags);
router.post("/", authentication, createStory);
router.patch("/:id", authentication, updateStory);
router.delete("/:id", authentication, deleteStory);
router.patch("/:id/likeStory", authentication, likeStory);
router.post("/:id/comment", authentication, commentOnStory);
router.delete("/:id/comments/:commentId", authentication, deleteComment);
router.delete("/user/:userId",  authentication, deleteUserStories);
router.delete("/comments/user/:userId",  authentication, deleteUserComments);

export default router;