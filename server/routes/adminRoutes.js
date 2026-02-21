import express from "express";
import {
  createQuiz,
  leaderboard,
  getAllQuizzes,
  startQuiz,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/quiz", protect, adminOnly, createQuiz);
router.get("/leaderboard", protect, adminOnly, leaderboard);
router.get("/quizzes", protect, adminOnly, getAllQuizzes);
router.post("/start", protect, adminOnly, startQuiz);

export default router;
