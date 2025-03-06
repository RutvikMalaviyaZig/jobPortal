const {
  validationEmail,
  validationCard,
} = require("../helpers/joy/validation");
const MESSAGES = require("../utils/Messages");
const HTTP_STATUS_CODE = require("../utils/HttpStatusCodes");

const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

module.exports = {
  createCustomer: async (req, res) => {
    try {
      const { error } = validationEmail(req.body);
      if (error) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: error.details[0].message,
        });
      }

      const { email } = req.body;

      const customer = await stripe.customers.create({
        email,
      });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: MESSAGES.CUSTOMER_ID_CREATED,
        data: customer,
      });
    } catch (error) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  },

  addNewCard: async (req, res) => {
    try {
      const { customerId } = req.body;

      const token = await stripe.tokens.retrieve("tok_visa");
    // console.log(token);
      // Create a payment method from the token
      const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
          token: token.id,
        },
      });

      // Attach the payment method to the customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customerId,
      });

      
      // Optionally set this payment method as the default payment method
    const one =  await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });
console.log(one);

      return res.status(200).json({
        status: 200,
        message: "Payment method successfully created and attached!",
        data: paymentMethod,
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: error.message,
      });
    }
  },

  paymentIntent: async (req, res) => {
    try {
      const { amount, currency, customerId, paymentMethodId } = req.body;

      // Create a Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert amount to the smallest unit (e.g., cents for USD or pence for GBP)
        currency: currency,
        customer: customerId,
        payment_method: paymentMethodId,
        confirmation_method: "manual", // Set to manual confirmation to handle async payments
        confirm: true, // Automatically confirm the payment intent
      });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        message: MESSAGES.PAYMENT_SUCCESSFULL,
        data: paymentIntent,
      });
    } catch (error) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  },
};
