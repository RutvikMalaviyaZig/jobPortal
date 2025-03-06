// import express
const express = require('express');

// import job routes 
const paymentRoute = require('./payRoutes')
// create router
const router = express.Router();

// user router
router.use('/payment', paymentRoute)

// export route
module.exports = router;