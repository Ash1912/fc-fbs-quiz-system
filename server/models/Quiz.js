import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number,
});

const quizSchema = new mongoose.Schema(
  {
    title: String,
    questions: [questionSchema],

    // NEW FIELDS
    isActive: { type: Boolean, default: false },
    startTime: Date,
    endTime: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Quiz", quizSchema);
