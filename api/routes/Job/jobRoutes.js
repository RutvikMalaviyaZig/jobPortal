const express = require('express');
const JobController = require('../../controllers/JobController');
const router = express.Router();


router.post('/create', JobController.createJob )
router.get('/list', JobController.listJobs)
router.post('/applyforjob', JobController.applyForJob)

module.exports = router;