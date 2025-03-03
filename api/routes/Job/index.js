// import express
const express = require('express');

// import job routes 
const jobRoute = require('./jobRoutes')
// create router
const router = express.Router();

// user router
router.use('/job', jobRoute)

// export route
module.exports = router;