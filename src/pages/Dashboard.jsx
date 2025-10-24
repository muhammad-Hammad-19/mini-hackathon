import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router";
import { collection, onSnapshot } from "firebase/firestore";
import jsPDF from "jspdf";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(auth.currentUser);

    const unsubscribe = onSnapshot(collection(db, "pitches"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPitches(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/Login");
  };

  const handleDownloadPDF = (pitch) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("PitchCraft - AI Generated Pitch", 20, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    let y = 40;
    const addLine = (title, content) => {
      doc.setFont("helvetica", "bold");
      doc.text(title, 20, y);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content || "—", 170);
      doc.text(lines, 20, y + 6);
      y += lines.length * 7 + 10;
    };

    addLine("🏷️ Startup Name:", pitch.name);
    addLine("💬 Tagline:", pitch.tagline);
    addLine("🧠 Summary:", pitch.summary);
    addLine("🚧 Problem:", pitch.problem);
    addLine("💡 Solution:", pitch.solution);
    addLine("👥 Audience:", pitch.audience);
    addLine("🌐 Landing Copy:", pitch.landing_copy);
    addLine(
      "🕒 Created At:",
      pitch.createdAt?.seconds
        ? new Date(pitch.createdAt.seconds * 1000).toLocaleString()
        : "Just now"
    );

    doc.save(`${pitch.name || "Pitch"}_PitchCraft.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg py-6 px-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            🚀 PitchCraft Dashboard
          </h1>
          <p className="text-indigo-100">
            Welcome,&nbsp;
            <span className="font-semibold">
              {user?.displayName || user?.email || "Guest"}
            </span>
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={() => navigate("/PitchInputForm")}
            className="bg-white text-indigo-700 px-5 py-2 rounded-lg font-medium hover:bg-indigo-100 transition"
          >
            ➕ New Pitch
          </button>
          <button
            onClick={handleLogout}
            className="bg-transparent border border-white/70 text-white px-5 py-2 rounded-lg hover:bg-white/20 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-400 border-t-transparent"></div>
          </div>
        ) : pitches.length === 0 ? (
          <div className="text-center py-20">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="No pitches"
              className="mx-auto w-40 mb-6 opacity-80"
            />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No Pitches Yet 😔
            </h2>
            <p className="text-gray-500 mb-6">
              Let’s turn your next big idea into a startup pitch!
            </p>
            <button
              onClick={() => navigate("/PitchInputForm")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition"
            >
              Create Your First Pitch 🚀
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {pitches.map((pitch) => (
              <div
                key={pitch.id}
                className="backdrop-blur-lg bg-white/70 border border-white/40 shadow-xl rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-transform"
              >
                <div className="mb-3">
                  <h3 className="text-2xl font-bold text-indigo-700">
                    {pitch.name || "Unnamed Startup"}
                  </h3>
                  <p className="italic text-gray-600 mb-3">
                    “{pitch.tagline || "No tagline"}”
                  </p>
                </div>

                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {pitch.summary || "No summary available."}
                </p>

                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>
                    <strong className="text-gray-800">🚧 Problem:</strong>{" "}
                    {pitch.problem || "—"}
                  </p>
                  <p>
                    <strong className="text-gray-800">💡 Solution:</strong>{" "}
                    {pitch.solution || "—"}
                  </p>
                  <p>
                    <strong className="text-gray-800">👥 Audience:</strong>{" "}
                    {pitch.audience || "—"}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {pitch.createdAt?.seconds
                      ? new Date(
                          pitch.createdAt.seconds * 1000
                        ).toLocaleString()
                      : "Just now"}
                  </span>
                  <button
                    onClick={() => handleDownloadPDF(pitch)}
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    ⬇️ Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button (Mobile) */}
      <button
        onClick={() => navigate("/PitchInputForm")}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform text-2xl md:hidden"
        title="New Pitch"
      >
        +
      </button>
    </div>
  );
}
