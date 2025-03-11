const express = require('express');
const job = require('./Job')
const user = require('./User')
const payment = require('./payment');
const { webHook, listenEvent } = require('../controllers/webHooks');
const router = express.Router();


router.use('/v1', job)
router.use('/v1',user)
router.use('/v1', payment)
// router.use('/v1/webhook', webHook)
// router.use('/v1/webhook' , listenEvent)


module.exports = router;