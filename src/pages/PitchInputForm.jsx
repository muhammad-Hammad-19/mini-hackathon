import { useForm } from "react-hook-form";
import { useState } from "react";
import { generatePitch } from "../service/googlegemini";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; 

export default function PitchInputForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState(null);

  const handleGenerate = async (idea, industry, tone) => {
    try {
      if (!idea || !industry) {
        alert("Please fill idea and industry first.");
        return;
      }
      setLoading(true);
      const pitch = await generatePitch(idea, industry, tone);

      setGeneratedPitch(pitch);

      reset({
        startupName: pitch.startupName,
        tagline: pitch.tagline,
        elevatorPitch: pitch.elevatorPitch,
      });
    } catch (error) {
      alert("Error generating pitch: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  
  const onSubmit = async (data) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login first!");
        return;
      }

      await addDoc(collection(db, "startupIdeas"), {
        ...data,
        userId: user.uid,
        createdAt: new Date(),
      });

      alert("✅ Pitch saved successfully!");
      reset();
      setGeneratedPitch(null);
    } catch (error) {
      alert("❌ Error saving pitch: " + error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center">
        ✨ Create Your Startup Pitch
      </h2>

      {/* Generate Section */}
      <GeneratePitchControls onGenerate={handleGenerate} loading={loading} />

      {/* Pitch Display / Form */}
      {generatedPitch && (
        <div className="bg-gray-50 border border-gray-300 p-4 rounded mb-4">
          <h3 className="text-xl font-semibold mb-2">🎯 AI Generated Pitch</h3>
          <p>
            <strong>Name:</strong> {generatedPitch.startupName}
          </p>
          <p>
            <strong>Tagline:</strong> {generatedPitch.tagline}
          </p>
          <p>
            <strong>Pitch:</strong> {generatedPitch.elevatorPitch}
          </p>
        </div>
      )}

      {/* Save Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("startupName", { required: true })}
          placeholder="Startup Name"
          className="w-full border p-2 rounded"
        />
        {errors.startupName && (
          <p className="text-red-500 text-sm">Startup Name is required</p>
        )}

        <input
          {...register("tagline", { required: true })}
          placeholder="Tagline"
          className="w-full border p-2 rounded"
        />
        {errors.tagline && (
          <p className="text-red-500 text-sm">Tagline is required</p>
        )}

        <textarea
          {...register("elevatorPitch", { required: true })}
          placeholder="Elevator Pitch"
          className="w-full border p-2 rounded"
          rows="3"
        />
        {errors.elevatorPitch && (
          <p className="text-red-500 text-sm">Elevator Pitch is required</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Saving..." : "💾 Save Pitch"}
        </button>
      </form>
    </div>
  );
}

// ✅ Subform for AI Generation Input
function GeneratePitchControls({ onGenerate, loading }) {
  const { register, handleSubmit, reset } = useForm();

  const submitHandler = (data) => {
    onGenerate(data.idea, data.industry, data.tone);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="mb-6 space-y-2 bg-gray-100 p-4 rounded"
    >
      <h3 className="text-lg font-semibold mb-2">💡 Describe Your Idea</h3>

      <input
        {...register("idea", { required: true })}
        placeholder="Your startup idea (e.g. app for student mentors)"
        className="w-full border p-2 rounded"
      />
      <input
        {...register("industry", { required: true })}
        placeholder="Industry (e.g. Education, Tech, Health)"
        className="w-full border p-2 rounded"
      />

      <select {...register("tone")} className="w-full border p-2 rounded">
        <option value="professional">Professional</option>
        <option value="casual">Casual</option>
        <option value="innovative">Innovative</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 transition"
      >
        {loading ? "Generating..." : "⚡ Generate Pitch"}
      </button>
    </form>
  );
}
