import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../components/Modal";
import CreateJob from "../components/CreateJob";
import JobList from "../components/JobList";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null); // 🆕 for edit tracking

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // 🔄 Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5050/api/jobs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setJobs(data.jobs);
      } else {
        console.error("Failed to fetch jobs", data.msg);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err.message);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 🔓 Modal Controls
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingJob(null); // 🧼 reset after edit
  };

  // 📝 Handle Edit button click
  const handleEdit = (job) => {
    setEditingJob(job);
    openModal();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        {user && (
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {user.name} 👋
          </h2>
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>

      {/* Header + Create Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={() => {
            setEditingJob(null); // ✅ make sure it's a "create" not "edit"
            openModal();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ➕ Create Job
        </button>
      </div>

      {/* Job List */}
      <JobList jobs={jobs} onDelete={fetchJobs} onEdit={handleEdit} />

      {/* Create/Edit Job Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <CreateJob
          onJobCreated={() => {
            fetchJobs();
            closeModal();
          }}
          editingJob={editingJob} // 👈 Pass job for edit, null for create
          onClose={closeModal}
        />
      </Modal>
    </div>
  );
}
