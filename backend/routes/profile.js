import { Router } from "express";
import { getProfile, getUserProfile, getAllProfiles } from "../controlers/profile.js";
const router = Router();
import authentication from '../midlewares/authentication.js'

router.get("/", authentication, getProfile);
router.get("/users/:userId", authentication, getUserProfile);
router.get("/users", authentication, getAllProfiles);

export default router;