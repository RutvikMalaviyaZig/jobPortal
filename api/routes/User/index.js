// import express
const express = require('express');

// import job routes 
const userRoute = require('./userRoutes')
// create router
const router = express.Router();

// user router
router.use('/user', userRoute)

// export route
module.exports = router;