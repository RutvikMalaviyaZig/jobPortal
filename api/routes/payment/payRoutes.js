// const express = require('express');

// const router = express.Router();
// const paymentController = require('../../controllers/paymentController')

// router.post('/createCustomer', paymentController.createCustomer )
// router.post('/addCard', paymentController.addNewCard)
// router.post('/createCharges',paymentController.createCharges)
// // router.post('/token',paymentController.createToken)
// router.post('/intent', paymentController.paymentIntent)

// module.exports = router;


const express = require("express");
const router = express.Router();

// Importing the controller
const paymentController = require("../../controllers/paymentController");

// Route for creating a customer
router.post("/create-customer", paymentController.createCustomer);

// Route for adding a new card to the customer
router.post("/add-card", paymentController.addNewCard);

// Route for creating a payment intent
router.post("/payment-intent", paymentController.paymentIntent);

// Route for creating a charge (processing a payment)
// router.post("/create-charge", paymentController.createCharges);

module.exports = router;
