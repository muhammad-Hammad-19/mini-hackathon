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
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);

    const unsubscribe = onSnapshot(collection(db, "startupIdeas"), (snapshot) => {
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

  // ✅ Generate PDF for a single pitch
  const handleDownloadPDF = (pitch) => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("PitchCraft - AI Generated Pitch", 20, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    let y = 40;
    const addLine = (title, content) => {
      doc.setFont("helvetica", "bold");
      doc.text(title, 20, y);
      doc.setFont("helvetica", "normal");
      const split = doc.splitTextToSize(content || "—", 170);
      doc.text(split, 20, y + 6);
      y += split.length * 7 + 10;
    };

    addLine("💡 User Idea:", pitch.idea);
    addLine("🏷️ Startup Name:", pitch.startupName);
    addLine("💬 Tagline:", pitch.tagline);
    addLine("🧠 Elevator Pitch:", pitch.elevatorPitch);
    addLine("📊 Industry:", pitch.industry || "Not specified");
    addLine(
      "🕒 Created At:",
      pitch.createdAt?.seconds
        ? new Date(pitch.createdAt.seconds * 1000).toLocaleString()
        : "Just now"
    );

    doc.save(`${pitch.startupName || "Pitch"}_PitchCraft.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🎯 PitchCraft Dashboard</h1>
            <p className="text-gray-600">
              Welcome,&nbsp;
              <span className="font-semibold text-blue-600">
                {user?.displayName || user?.email || "Guest"}
              </span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/PitchInputForm")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              ➕ New Pitch
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Pitches Section */}
        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading pitches...</p>
        ) : pitches.length === 0 ? (
          <div className="text-center py-12">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="No pitches"
              className="mx-auto w-40 mb-4 opacity-80"
            />
            <p className="text-gray-600 mb-4 text-lg">
              No pitches yet. Ready to build your startup dream?
            </p>
            <button
              onClick={() => navigate("/PitchInputForm")}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Create Your First Pitch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitches.map((pitch) => (
              <div
                key={pitch.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition transform"
              >
                {/* User Question */}
                <div className="mb-3">
                  <p className="text-gray-400 text-sm">💡 User Idea</p>
                  <p className="text-gray-800 font-medium bg-gray-50 border rounded-md p-2">
                    {pitch.idea || "—"}
                  </p>
                </div>

                {/* AI Generated Answer */}
                <h3 className="text-xl font-bold text-blue-700 mt-3">
                  {pitch.startupName || "Unnamed Startup"}
                </h3>
                <p className="text-gray-600 italic mb-1">“{pitch.tagline || "No tagline"}”</p>
                <p className="text-gray-700 text-sm leading-relaxed mb-2">
                  {pitch.elevatorPitch || "No pitch generated yet."}
                </p>

                {/* Metadata + PDF button */}
                <div className="flex justify-between items-center text-xs text-gray-400 mt-3">
                  <span>{pitch.industry ? `📊 ${pitch.industry}` : ""}</span>
                  <span>
                    {pitch.createdAt?.seconds
                      ? new Date(pitch.createdAt.seconds * 1000).toLocaleString()
                      : "Just now"}
                  </span>
                </div>

                <button
                  onClick={() => handleDownloadPDF(pitch)}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
                >
                  ⬇️ Download as PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button for Mobile */}
      <button
        onClick={() => navigate("/PitchInputForm")}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 text-2xl md:hidden"
        title="New Pitch"
      >
        +
      </button>
    </div>
  );
}
