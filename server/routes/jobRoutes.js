const express = require("express");
const router = express.Router();

const { getJobs, createJob } = require("../controllers/jobController");

router.route("/")
  .get(getJobs)     // GET /api/jobs
  .post(createJob); // POST /api/jobs

module.exports = router;
