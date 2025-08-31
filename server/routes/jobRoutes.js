const express = require("express");
const router = express.Router();

const { getJobs, createJob, updateJob, deleteJob } = require("../controllers/jobController");

router.route("/")
  .get(getJobs)     // GET /api/jobs
  .post(createJob); // POST /api/jobs

router.route("/:id")
  .put(updateJob)
  .delete(deleteJob);

module.exports = router;
