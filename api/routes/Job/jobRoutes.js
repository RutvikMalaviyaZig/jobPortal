const express = require('express');
const JobController = require('../../controllers/JobController');
const router = express.Router();


router.post('/create', JobController.createJob )
router.get('/list', JobController.listJobs)
router.post('/applyforjob', JobController.applyForJob)
router.post('/acceptjob', JobController.acceptJobRequest)
router.put('/updatejob', JobController.updateJob)
router.post('/deletejob', JobController.deleteJob)

module.exports = router;