const express = require('express');
const job = require('./Job')
const user = require('./User')
const payment = require('./payment')
const router = express.Router();


router.use('/v1', job)
router.use('/v1',user)
router.use('/v1', payment)

module.exports = router;