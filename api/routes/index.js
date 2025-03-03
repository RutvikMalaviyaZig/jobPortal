const express = require('express');
const job = require('./Job')
const user = require('./User')
const router = express.Router();


router.use('/v1', job)
router.use('/v1',user)

module.exports = router;