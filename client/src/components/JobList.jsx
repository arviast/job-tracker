export default function JobList({ jobs, onDelete, onEdit }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-gray-600 text-center mt-10">
        <p className="text-lg">No jobs found.</p>
        <p className="text-sm">Click "Create Job" to add your first one.</p>
      </div>
    );
  }

  const handleDelete = async (jobId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.BACKEND_URL}/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Job deleted:", jobId);
        onDelete();
      } else {
        console.error("Failed to delete job:", data.msg);
      }
    } catch (err) {
      console.error("Error deleting job:", err.message);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {
        jobs.map((job) => (
          <div
            key={job._id}
            className="bg-white shadow-md p-6 rounded-xl border border-gray-200"
          >
            <div className="flex justify-between items-start">
              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-md text-sm font-semibold ${job.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : job.status === "interview"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
              >
                {job.status}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(job)}
                  className="text-blue-600 hover:text-blue-800 text-lg"
                  title="Edit job"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(job._id)}
                  className="text-red-600 text-xl hover:text-red-800"
                  title="Delete Job"
                >
                  ❌
                </button>
              </div>

            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-2">
              {job.position}
            </h2>

            <p className="text-gray-700 mt-1">
              <span className="font-semibold">Company:</span> {job.company}
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Location:</span> {job.location}
            </p>

            <p className="text-gray-500 italic mt-1">
              Created: {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))
      }
    </div>
  );
}
