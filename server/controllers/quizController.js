import Quiz from "../models/Quiz.js";
import Result from "../models/Result.js";

export const getQuiz = async (req, res) => {
  try {
    const userId = req.user.id;

    const quiz = await Quiz.findOne({ isActive: true });

    if (!quiz) {
      return res.status(404).json({ message: "No active quiz" });
    }

    // 🚫 Block if quiz ended
    if (quiz.endTime && new Date() > quiz.endTime) {
      return res.status(400).json({ message: "Quiz has ended" });
    }

    // 🔒 NEW: Check if already submitted
    const existingSubmission = await Result.findOne({
      userId,
      quizId: quiz._id,
    });

    if (existingSubmission) {
      return res.status(403).json({ message: "Already submitted" });
    }

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { answers, timeTaken, tabSwitchCount } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findOne({ isActive: true });

    if (!quiz) {
      return res.status(400).json({ message: "No active quiz" });
    }

    // 🚫 BLOCK if quiz ended
    if (quiz.endTime && new Date() > quiz.endTime) {
      return res.status(400).json({ message: "Quiz has ended" });
    }

    // 🔒 Prevent double submission (✅ CORRECT PLACE)
    const existingSubmission = await Result.findOne({
      userId,
      quizId: quiz._id,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: "Quiz already submitted" });
    }

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    const disqualified = tabSwitchCount >= 3;

    const result = await Result.create({
      userId,
      quizId: quiz._id,
      score,
      timeTaken,
      tabSwitchCount,
      disqualified,
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
