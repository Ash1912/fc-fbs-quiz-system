"use client";

import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);

  const [leaderboard, setLeaderboard] = useState([]);
  const [quizPublished, setQuizPublished] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [duration, setDuration] = useState(10); // minutes

  /* ================= AUTH + LIVE LEADERBOARD ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchLeaderboard = () => {
      api
        .get("/admin/leaderboard", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setLeaderboard(res.data);
          if (res.data.length > 0) setQuizPublished(true);
        })
        .catch(() => router.push("/login"));
      api
        .get("/admin/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setQuizzes(res.data));
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000); // 🔄 live refresh

    return () => clearInterval(interval);
  }, []);

  /* ================= CREATE QUIZ ================= */
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: 0 },
    ]);
  };

  const startQuiz = async (quizId) => {
    const token = localStorage.getItem("token");

    await api.post(
      "/admin/start",
      { quizId, duration },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    alert("Quiz Started 🚀");

    const res = await api.get("/admin/quizzes", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setQuizzes(res.data);
  };

  const submitQuiz = async () => {
    const token = localStorage.getItem("token");

    await api.post(
      "/admin/quiz",
      { title, questions },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    setQuizPublished(true);
    alert("Quiz Published 🎉");
  };

  /* ================= EXPORT CSV ================= */
  const exportCSV = () => {
    if (leaderboard.length === 0) return;

    const rows = [
      ["Rank", "Name", "Score", "Time Taken", "Tab Switches"],
      ...leaderboard.map((r, i) => [
        i + 1,
        r.userId?.name || "—",
        r.score,
        `${r.timeTaken}s`,
        r.tabSwitchCount,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `leaderboard-${leaderboard[0]?.quizId?.title || "quiz"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#261753]">
      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-[#261753] to-[#3b2a6f] px-8 py-4 flex justify-between items-center shadow">
        <h1 className="text-2xl font-extrabold text-[#B09EE4]">
          Admin Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="text-sm text-white font-semibold hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-8 space-y-10">
        {/* ================= LEADERBOARD (FULL SCREEN AFTER PUBLISH) ================= */}
        {quizPublished && (
          <div className="bg-white rounded-2xl shadow-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">🏆 Leaderboard</h2>
                <p className="text-sm font-semibold text-[#4B3F8C]">
                  Quiz: {leaderboard[0]?.quizId?.title || "—"}
                </p>
              </div>

              <button
                onClick={exportCSV}
                className="px-4 py-2 rounded-lg bg-[#261753] text-white text-sm font-semibold hover:opacity-90"
              >
                ⬇ Export CSV
              </button>
            </div>

            <div className="overflow-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F6FF]">
                  <tr>
                    <th className="p-3 border">#</th>
                    <th className="p-3 border">Name</th>
                    <th className="p-3 border">Score</th>
                    <th className="p-3 border">Time</th>
                    <th className="p-3 border">Tab Switch</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((r, i) => (
                    <tr key={i} className="text-center hover:bg-[#F4F1FF]">
                      <td className="p-3 border font-semibold">{i + 1}</td>
                      <td className="p-3 border">{r.userId?.name}</td>
                      <td className="p-3 border font-bold">{r.score}</td>
                      <td className="p-3 border">{r.timeTaken}s</td>
                      <td className="p-3 border">{r.tabSwitchCount}</td>
                    </tr>
                  ))}

                  {leaderboard.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-6 text-center text-[#3A3A3A]"
                      >
                        No submissions yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border p-6">
          <h2 className="text-xl font-bold mb-4">📚 Created Quizzes</h2>

          <div className="mb-4">
            <label className="text-sm font-semibold">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="ml-3 w-24 px-2 py-1 border rounded"
            />
          </div>

          {quizzes.map((q) => (
            <div
              key={q._id}
              className="flex justify-between items-center border p-3 rounded-lg mb-3"
            >
              <div>
                <p className="font-semibold">{q.title}</p>
                <p className="text-xs text-gray-500">
                  {q.isActive ? "🟢 Active" : "⚪ Not Active"}
                </p>
              </div>

              {!q.isActive && (
                <button
                  onClick={() => startQuiz(q._id)}
                  className="px-4 py-1 bg-green-600 text-white rounded"
                >
                  ▶ Start
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ================= CREATE QUIZ (MOVES DOWN) ================= */}
        <div className="bg-white rounded-2xl shadow-xl border p-6">
          <h2 className="text-xl font-bold mb-6">📝 Create New Quiz</h2>

          <input
            className="w-full h-12 px-4 rounded-lg border bg-[#F8F6FF] mb-6 focus:outline-none focus:ring-2 focus:ring-[#B09EE4]"
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {questions.map((q, qIndex) => (
            <div
              key={qIndex}
              className="mb-6 rounded-xl border bg-[#FAFAFF] p-4"
            >
              <p className="font-semibold mb-3">Question {qIndex + 1}</p>

              <input
                className="w-full p-3 border rounded-lg mb-4"
                placeholder="Enter question"
                value={q.question}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIndex].question = e.target.value;
                  setQuestions(updated);
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${
                      q.correctAnswer === oIndex
                        ? "border-green-500 bg-green-50"
                        : "bg-white hover:bg-[#F4F1FF]"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === oIndex}
                      onChange={() => {
                        const updated = [...questions];
                        updated[qIndex].correctAnswer = oIndex;
                        setQuestions(updated);
                      }}
                    />
                    <input
                      className="flex-1 bg-transparent outline-none"
                      placeholder={`Option ${oIndex + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[qIndex].options[oIndex] = e.target.value;
                        setQuestions(updated);
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <button
              onClick={addQuestion}
              className="px-4 py-2 rounded-lg bg-[#EAE6FF] font-semibold"
            >
              ➕ Add Question
            </button>

            <button
              onClick={submitQuiz}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#B09EE4] to-[#8F7AE6] text-white font-semibold"
            >
              ✅ Publish Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
