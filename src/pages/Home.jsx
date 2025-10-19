import { Link } from "react-router";
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 flex flex-col justify-center items-center px-6">
      <h1 className="text-white text-5xl font-extrabold mb-6 text-center drop-shadow-lg">
        Welcome to <span className="text-yellow-300">PitchCraft</span>
      </h1>
      <p className="text-indigo-100 max-w-xl text-center mb-10 text-lg font-light drop-shadow">
        Your AI Startup Partner — Generate creative pitches, taglines, and more with just a click.
      </p>
      <div className="flex space-x-6">
        <Link
          to="/login"
          className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:bg-indigo-100 transition"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-8 py-3 bg-yellow-400 text-indigo-900 font-semibold rounded-lg shadow-lg hover:bg-yellow-300 transition"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
