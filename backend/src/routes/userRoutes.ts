import express from "express";
import { registerUser, checkUser } from "../controllers/userController";

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Check if a user exists
router.post("/check", checkUser);

export default router;
