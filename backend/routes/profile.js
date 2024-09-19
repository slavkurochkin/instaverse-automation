import { Router } from "express";
import { getProfile, getUserProfile } from "../controlers/profile.js";
const router = Router();
import authentication from '../midlewares/authentication.js'

router.get("/", authentication, getProfile);
router.get("/:userId", authentication, getUserProfile);

export default router;