const Job = require("../models/Job");

const getJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId });
  res.status(200).json({ count: jobs.length, jobs });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(201).json(job);
};

const updateJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    return res.status(404).json({ msg: "Job not found" });
  }

  if (job.createdBy.toString() !== req.user.userId) {
    return res.status(403).json({ msg: "Not authorized to update this job" });
  }

  const updatedJob = await Job.findByIdAndUpdate(jobId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(updatedJob);
};

const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    return res.status(404).json({ msg: "Job not found" });
  }

  if (job.createdBy.toString() !== req.user.userId) {
    return res.status(403).json({ msg: "Not authorized to delete this job" });
  }

  await job.deleteOne();

  res.status(200).json({ msg: "Job deleted successfully" });
};

module.exports = { getJobs, createJob, updateJob, deleteJob };
