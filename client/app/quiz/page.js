"use client";
import api from "../../utils/api";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [tabSwitch, setTabSwitch] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [token, setToken] = useState(null);
  const [startCountdown, setStartCountdown] = useState(null);

  const startTimeRef = useRef(null);
  const hasSubmitted = useRef(false);
  const router = useRouter();

  // ✅ Load token safely
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  // ✅ Auto Submit
  const autoSubmit = async (tabCount) => {
    if (hasSubmitted.current || !quizStarted) return;

    hasSubmitted.current = true;
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      await api.post(
        "/quiz/submit",
        { answers, timeTaken, tabSwitchCount: tabCount },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      localStorage.removeItem("token"); // 🔥 logout
      alert("Quiz Submitted");
      router.push("/login"); // 🔥 redirect
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Manual Submit
  const submit = async () => {
    if (quizEnded || hasSubmitted.current || !quizStarted) return;

    hasSubmitted.current = true;
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      await api.post(
        "/quiz/submit",
        { answers, timeTaken, tabSwitchCount: tabSwitch },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      localStorage.removeItem("token"); // 🔥 logout
      alert("Quiz Submitted Successfully");
      router.push("/login"); // 🔥 redirect
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ 1️⃣ Fetch + Poll until started
  useEffect(() => {
    if (!token) return;

    let refreshInterval;

    const fetchQuiz = async () => {
      try {
        const res = await api.get("/quiz", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        if (!data?.isActive) {
          setQuiz(data);
          setQuizStarted(false);
          return;
        }

        setQuiz(data);
        setQuizStarted(true);

        if (!startTimeRef.current) {
          startTimeRef.current = Date.now();
        }

        clearInterval(refreshInterval);
      } catch (err) {
        if (err.response?.status === 403) {
          localStorage.removeItem("token");
          alert("You have already submitted the quiz.");
          router.push("/login");
          return;
        }

        console.error(err);
      }
    };

    fetchQuiz();

    refreshInterval = setInterval(() => {
      fetchQuiz();
    }, 5000);

    return () => clearInterval(refreshInterval);
  }, [token]);

  // ✅ 2️⃣ Countdown before start
  useEffect(() => {
    if (!quiz || quizStarted || !quiz.startTime) return;

    const start = new Date(quiz.startTime).getTime();

    const interval = setInterval(() => {
      const diff = Math.floor((start - Date.now()) / 1000);

      if (diff <= 0) {
        clearInterval(interval);
      } else {
        setStartCountdown(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz, quizStarted]);

  // ✅ 3️⃣ Timer after start
  useEffect(() => {
    if (!quizStarted || !quiz?.endTime) return;

    const end = new Date(quiz.endTime).getTime();

    const interval = setInterval(() => {
      const diff = Math.floor((end - Date.now()) / 1000);

      if (diff <= 0) {
        clearInterval(interval);
        autoSubmit(tabSwitch);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quizStarted, tabSwitch]);

  // ✅ 4️⃣ Tab Switch Detection
  useEffect(() => {
    if (!quizStarted) return;

    const visibility = () => {
      if (document.hidden) {
        setTabSwitch((prev) => {
          const newCount = prev + 1;
          if (newCount >= 3) autoSubmit(newCount);
          return newCount;
        });

        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    document.addEventListener("visibilitychange", visibility);

    return () => document.removeEventListener("visibilitychange", visibility);
  }, [quizStarted]);

  // 🔵 QUIZ NOT STARTED SCREEN
  if (!quizStarted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-[#261753] mb-4">
            ⏳ Quiz Not Started Yet
          </h2>

          {startCountdown !== null ? (
            <p className="text-lg font-semibold text-green-600 mb-4">
              Quiz starts in {Math.floor(startCountdown / 60)}m{" "}
              {startCountdown % 60}s
            </p>
          ) : (
            <p className="text-gray-600 mb-4">
              Waiting for admin to start the quiz...
            </p>
          )}

          <div className="animate-pulse text-sm text-gray-400">
            Auto-refreshing...
          </div>
        </div>
      </div>
    );

  if (!quiz) return <p className="text-center mt-20">Loading Quiz...</p>;

  return (
    <div className="min-h-screen bg-[#F4F6FB] p-6 text-black">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold">{quiz.title}</h1>
          <span>
            Tab Switches:{" "}
            <span
              className={tabSwitch >= 3 ? "text-red-600" : "text-green-600"}
            >
              {tabSwitch}
            </span>
          </span>
        </div>

        {timeLeft > 0 && (
          <div className="mb-4 text-right font-bold text-red-600">
            Time Left: {timeLeft}s
          </div>
        )}

        {showWarning && (
          <div className="mb-6 p-3 rounded-lg bg-red-100 border text-red-700 text-sm">
            ⚠️ After 3 tab switches quiz auto-submits.
          </div>
        )}

        {quiz.questions.map((q, i) => (
          <div key={i} className="mb-6 border rounded-xl p-4">
            <p className="font-semibold mb-4">
              {i + 1}. {q.question}
            </p>

            {q.options.map((opt, idx) => (
              <button
                key={idx}
                disabled={quizEnded}
                onClick={() => {
                  const a = [...answers];
                  a[i] = idx;
                  setAnswers(a);
                }}
                className={`block w-full p-3 mb-2 border rounded ${
                  answers[i] === idx ? "bg-[#261753] text-white" : "bg-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        ))}

        <button
          onClick={submit}
          disabled={quizEnded}
          className={`w-full mt-6 py-3 rounded-lg font-bold ${
            quizEnded
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#B09EE4] to-[#8F7AE6] text-white"
          }`}
        >
          {quizEnded ? "Quiz Ended" : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}
