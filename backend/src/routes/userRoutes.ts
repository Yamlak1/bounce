import express from "express";
import { registerUser, checkUser } from "../controllers/userController";

const router = express.Router();

router.post("/register", registerUser);

router.post("/check", checkUser);

export default router;
