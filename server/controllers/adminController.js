import Quiz from "../models/Quiz.js";
import Result from "../models/Result.js";

export const createQuiz = async (req, res) => {
  const quiz = await Quiz.create(req.body);
  res.json(quiz);
};

export const leaderboard = async (req, res) => {
  const data = await Result.find({ disqualified: false })
    .populate("userId", "name")
    .populate("quizId", "title")
    .sort({ score: -1, timeTaken: 1, tabSwitchCount: 1 });

  res.json(data);
};

// Get all quizzes (for admin dashboard)
export const getAllQuizzes = async (req, res) => {
  const quizzes = await Quiz.find().sort({ createdAt: -1 });
  res.json(quizzes);
};

// Start a specific quiz
export const startQuiz = async (req, res) => {
  const { quizId, duration } = req.body; // duration in minutes

  // Stop all other quizzes
  await Quiz.updateMany({}, { isActive: false });

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const quiz = await Quiz.findByIdAndUpdate(
    quizId,
    {
      isActive: true,
      startTime,
      endTime,
    },
    { new: true },
  );

  res.json({ message: "Quiz started", quiz });
};
