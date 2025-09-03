import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../components/Modal";
import CreateJob from "../components/CreateJob";
import JobList from "../components/JobList";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null); // 🆕 for edit tracking

  const [filterStatus, setFilterStatus] = useState("all");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const filteredJobs =
    filterStatus === "all"
      ? jobs
      : jobs.filter((job) => job.status === filterStatus);

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;

  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // 🔄 Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      const res = await fetch("https://job-tracker-5wcn.onrender.com/api/jobs", {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

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

      <div className="flex gap-2 mb-6">
        {["all", "pending", "interview", "declined", "offer"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-1 rounded-lg border ${filterStatus === status
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-800"
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <JobList jobs={paginatedJobs} onDelete={fetchJobs} onEdit={handleEdit} />
      <div className="flex justify-center items-center gap-2 mt-6">

        {/* Previous button */}
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${currentPage === 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
        >
          ⬅️ Prev
        </button>

        {/* Page numbers */}
        {[...Array(totalPages)].map((_, index) => {
          const pageNum = index + 1;
          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`px-3 py-1 rounded ${currentPage === pageNum
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next button */}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${currentPage === totalPages
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
        >
          Next ➡️
        </button>

      </div>


      {/* Create/Edit Job Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingJob ? "Edit Job" : "Create Job"}>
        <CreateJob
          job={editingJob}
          onJobCreated={() => {
            fetchJobs();
            closeModal();
          }}
        />
      </Modal>

    </div>
  );
}
