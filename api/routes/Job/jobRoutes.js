const express = require('express');
const JobController = require('../../controllers/JobController');
const router = express.Router();


router.post('/create', JobController.createJob )
router.get('/listjobsforuser', JobController.listJobs)
router.post('/applyforjob', JobController.applyForJob)
router.post('/acceptjob', JobController.acceptJobRequest)
router.put('/updatejob', JobController.updateJob)
router.post('/deletejob', JobController.deleteJob)
router.get('/userprofile', JobController.userProfileView)
router.get('/jobusersdetails', JobController.allUsesInParticularJob)


module.exports = router;