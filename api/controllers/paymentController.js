const {
  validationEmail,
  validationCard,
} = require("../helpers/joy/validation");
const MESSAGES = require("../utils/Messages");
const HTTP_STATUS_CODE = require("../utils/HttpStatusCodes");
const User = require("../models/User");
const CardDetails = require("../models/CardDetails");

const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

module.exports = {
  createCustomer: async (req, res) => {
    try {
      
      const { email , userId} = req.body;
      const { error } = validationEmail(req.body);
      if (error) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: error.details[0].message,
        });
      }
      
      const customer = await stripe.customers.create({
        email,
      });

      const storeInDB = await User.update(
        { customerId: customer.id },
        {
          where: {
            userId
          },
        }
      );

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

      //check card is already exist or not

      await CardDetails.create({
        cardId: token.card.id,
        cardExpYear: token.card.exp_year,
        cardExpMonth: token.card.exp_month,
        cardLast4Digit: token.card.last4,
      });
      // // Create a payment method from the token
      // const paymentMethod = await stripe.paymentMethods.create({
      //   type: "card",
      //   card: {
      //     token: token.id,
      //   },
      // });

      // // Attach the payment method to the customer
      // await stripe.paymentMethods.attach(paymentMethod.id, {
      //   customer: customerId,
      // });

      // // Optionally set this payment method as the default payment method
      // const one = await stripe.customers.update(customerId, {
      //   invoice_settings: {
      //     default_payment_method: paymentMethod.id,
      //   },
      // });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: MESSAGES.PAYMENT_METHOD_ATTACHED,
        data: one,
        error: "",
      });
    } catch (error) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        errorCode: "",
        message: error.message,
        data: "",
        error: "",
      });
    }
  },

  paymentIntent: async (req, res) => {
    try {
      const { amount, currency, customerId, paymentMethodId } = req.body;

      // Create a Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: currency,
        customer: customerId,
        payment_method: paymentMethodId,
        confirm:true,
        automatic_payment_methods: {
          enabled: true, // Enable automatic payment methods
          allow_redirects: "never", // Avoid redirects
        },
      });

      // If the paymentIntent is confirmed successfully without redirect, return the success response
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: MESSAGES.PAYMENT_SUCCESSFULL,
        data: paymentIntent,
        error: "",
      });
    } catch (error) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        errorCode: "",
        message: error.message,
        data: "",
        error,
      });
    }
  },
};
