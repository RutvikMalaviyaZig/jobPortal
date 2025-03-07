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

// Route for adding a new card to the customer set it default and do payment
router.post("/add-card-and-payment", paymentController.addNewCardAndPayment);



module.exports = router;
