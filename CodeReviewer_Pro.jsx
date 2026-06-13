
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

const LANGS = ["JavaScript", "Python", "Java", "C++", "Go", "TypeScript"];

export default function CodeReviewer() {
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("Python");
  const [review, setReview] = useState("");
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------
  // AUTHENTICATION PLACEHOLDER
  // --------------------------
  const user = {
    uid: "demo-user",
    email: "user@example.com"
  };

  // --------------------------
  // DARK MODE
  // --------------------------
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // --------------------------
  // PDF EXPORT
  // --------------------------
  const exportPDF = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text("AI Code Review Report", 10, 15);

    const lines = pdf.splitTextToSize(review, 180);
    pdf.text(lines, 10, 30);

    pdf.save("review-report.pdf");
  };

  // --------------------------
  // FETCH REVIEW HISTORY
  // --------------------------
  const loadHistory = async () => {
    try {
      const response = await fetch("/api/history");

      const data = await response.json();

      if (response.ok) {
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // --------------------------
  // REVIEW GENERATION
  // --------------------------
  const runReview = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setReview("");

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code,
          lang,
          userId: user.uid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setReview(data.review);

      await loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold">
            AI Code Reviewer
          </h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border px-4 py-2 rounded"
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="mb-4">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="border p-2 rounded"
          >
            {LANGS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste source code..."
          className="w-full h-64 border rounded p-3 font-mono"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={runReview}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Reviewing..." : "Review Code"}
          </button>

          {review && (
            <button
              onClick={exportPDF}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Export PDF
            </button>
          )}
        </div>

        {error && (
          <div className="text-red-500 mt-3">
            {error}
          </div>
        )}

        {review && (
          <div className="mt-5 border rounded p-4 whitespace-pre-wrap">
            {review}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">
            Review History
          </h2>

          {history.length === 0 ? (
            <p>No history found.</p>
          ) : (
            history.map((item) => (
              <div
                key={item._id}
                className="border rounded p-3 mb-2"
              >
                <div>
                  <strong>{item.language}</strong>
                </div>

                <div className="text-sm opacity-75">
                  {item.createdAt}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
