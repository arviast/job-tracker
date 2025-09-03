import { useEffect, useState } from "react";

export default function CreateJob({ onJobCreated, job }) {
  const [formData, setFormData] = useState({
    position: "",
    company: "",
    location: "",
    status: "pending",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const isEditing = !!job;

      const response = await fetch(
        `${import.meta.env.BACKEND_URL}/api/jobs${isEditing ? `/${job._id}` : ""}`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

      const data = await response.json();

      if (!response.ok) throw new Error(data.msg || "Failed to create job");
      if (isEditing) {
        alert("Job updated successfully!");
      } else {
        alert("Job created successfully!");
      }

      setFormData({
        position: "",
        company: "",
        location: "",
        status: "pending",
      });

      if (response.ok) {
        onJobCreated(); // This triggers fetchJobs + closeModal
      }
    } catch (error) {
      console.error("Create job error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (job) {
      setFormData({
        position: job.position || "",
        company: job.company || "",
        location: job.location || "",
        status: job.status || "pending",
      });
    }
  }, [job]);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-md p-6 mt-6 grid gap-4 max-w-xl mx-auto"
    >
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Create Job</h2>

      <input
        type="text"
        name="position"
        placeholder="Position"
        value={formData.position}
        onChange={handleChange}
        required
        className="px-4 py-2 border border-gray-300 rounded-lg"
      />

      <input
        type="text"
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
        required
        className="px-4 py-2 border border-gray-300 rounded-lg"
      />

      <input
        type="text"
        name="location"
        placeholder="Location"
        value={formData.location}
        onChange={handleChange}
        required
        className="px-4 py-2 border border-gray-300 rounded-lg"
      />

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="px-4 py-2 border border-gray-300 rounded-lg"
      >
        <option value="pending">Pending</option>
        <option value="interview">Interview</option>
        <option value="declined">Declined</option>
        <option value="offer">Offer</option>
      </select>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Create Job"}
      </button>
    </form>
  );
}
