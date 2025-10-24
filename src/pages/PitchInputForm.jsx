import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";
import { db } from "../firebase";
import { useNavigate } from "react-router";
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export default function PitchInputForm() {
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState("professional");
  const [industry, setIndustry] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const main = async () => {
    if (!idea.trim()) return alert("⚠️ Please enter your startup idea!");

    try {
      setLoading(true);
      const prompt = `
      Tum ek AI startup partner ho jiska naam PitchCraft hai.
      User ka idea: "${idea}"
      Tone: "${tone}"
      Industry: "${industry}"

      Roman Urdu + English mix mein creative aur helpful answer do.
      Output structured JSON mein do:
      {
        "name": "",
        "tagline": "",
        "summary": "3-line short pitch",
        "problem": "",
        "solution": "",
        "audience": "",
        "landing_copy": ""
      }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text;
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : { summary: text };
      }

      // ✅ Save only AI response
      await setDoc(doc(db, "pitches", `${Date.now()}`), {
        ...parsed,
        createdAt: new Date(),
      });

      setOutput(parsed);
    } catch (error) {
      console.error("🔥 Error:", error);
      alert("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 drop-shadow-sm">
          🚀 PitchCraft
        </h1>
        <p className="text-gray-600 text-lg mt-2">
          Turn your idea into an AI-powered startup pitch 💡
        </p>
      </div>

      {/* Input Card */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-3xl shadow-2xl w-full max-w-2xl p-8">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
          ✍️ Enter Your Idea
        </h2>

        <textarea
          className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 outline-none mb-5 text-gray-800 placeholder-gray-400 resize-none"
          placeholder="Describe your startup idea... (e.g. An app that connects students with mentors)"
          rows={4}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
        />

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-gray-700 mb-1 font-medium">
              🎨 Tone
            </label>
            <select
              className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="fun">Fun</option>
              <option value="motivational">Motivational</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-gray-700 mb-1 font-medium">
              🏢 Industry
            </label>
            <input
              className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Education, Health, Tech"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={main}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-60"
        >
          {loading ? "Generating Magic ✨..." : "Generate Pitch 🚀"}
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="mt-10 w-full max-w-3xl backdrop-blur-xl bg-white/80 border border-white/50 rounded-3xl shadow-2xl p-8 text-gray-800">
          <h2 className="text-3xl font-bold text-indigo-700 mb-4 text-center">
            🎯 Your AI-Generated Pitch
          </h2>

          <div className="space-y-4 text-lg">
            {output.name && (
              <p className="text-2xl font-semibold text-indigo-700">
                {output.name}
              </p>
            )}
            {output.tagline && (
              <p className="italic text-gray-600 mb-3">“{output.tagline}”</p>
            )}
            {output.summary && (
              <p>
                <strong>💬 Summary:</strong> {output.summary}
              </p>
            )}
            {output.problem && (
              <p>
                <strong>🚧 Problem:</strong> {output.problem}
              </p>
            )}
            {output.solution && (
              <p>
                <strong>💡 Solution:</strong> {output.solution}
              </p>
            )}
            {output.audience && (
              <p>
                <strong>👥 Audience:</strong> {output.audience}
              </p>
            )}
            {output.landing_copy && (
              <p>
                <strong>🌐 Landing Copy:</strong> {output.landing_copy}
              </p>
            )}
          </div>

          <div className="mt-6 text-center flex gap-3 justify-center">
            <button
              onClick={() => setOutput(null)}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg transition"
            >
              🔁 Generate Another Pitch
            </button>
            <button
              onClick={() => navigate("/Dashboard")}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg transition"
            >
              🔁Check Pitches
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-gray-500 text-sm text-center">
        Made with 💜 by{" "}
        <span className="font-semibold text-indigo-600">PitchCraft AI</span>
      </footer>
    </div>
  );
}
