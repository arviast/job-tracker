import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    
    console.log(localStorage)
    if (!token || !user) {
      // Redirect to login if not authenticated
      console.log('here')
      navigate("/login");
    } else {
      setUserName(user.name);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome, {userName} 👋🏻
        </h1>
        <p className="text-gray-600 mb-6">
          This is your dashboard. You can display jobs, stats, or anything here.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
