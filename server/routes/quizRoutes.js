import express from "express";
import { getQuiz, submitQuiz } from "../controllers/quizController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getQuiz);
router.post("/submit", protect, submitQuiz); // ✅ IMPORTANT

export default router;
