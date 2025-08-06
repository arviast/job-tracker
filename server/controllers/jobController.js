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

module.exports = { getJobs, createJob };
