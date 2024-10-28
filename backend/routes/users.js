import { Router } from "express";
import { login, signup, deleteUser, updateUserProfile } from "../controlers/users.js";
import authentication from '../midlewares/authentication.js'

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.delete("/:userId", authentication, deleteUser);
router.patch("/:userId", authentication, updateUserProfile);

export default router;