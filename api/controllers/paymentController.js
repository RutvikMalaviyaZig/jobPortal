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
      const { email } = req.body;
      const { error } = validationEmail(req.body);
      if (error) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          message: error.details[0].message,
        });
      }

      const checkEmail = await User.findOne({ where: { email } });
      if (checkEmail) {
        const customer = await stripe.customers.create({
          email,
        });

        const storeInDB = await User.update(
          { stripeCustomerId: customer.id },
          {
            where: {
              email,
            },
          }
        );

        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          message: MESSAGES.CUSTOMER_ID_CREATED,
          data: [storeInDB, customer],
        });
      }
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.EMAIL_NOT_EXIST,
        data: "",
      });
    } catch (error) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  },

  addNewCardAndPayment: async (req, res) => {
    try {
      const { customerId, amount, currency } = req.body;

      const checkCustomerId = await User.findOne({
        where: { stripeCustomerId: customerId },
      });
      if (checkCustomerId) {
        const token = await stripe.tokens.retrieve("tok_visa");

        // Check if the card already exists
        const cardExist = await CardDetails.findOne({
          where: { cardLast4Digit: token.card.last4 },
        });

        if (!cardExist) {
          // Create new card entry in the database
          await CardDetails.create({
            cardId: token.card.id,
            cardExpYear: token.card.exp_year,
            cardExpMonth: token.card.exp_month,
            cardLast4Digit: token.card.last4,
          });

          // Add card to the customer's Stripe account
          const customerSource = await stripe.customers.createSource(
            customerId,
            {
              source: token.id,
            }
          );

          // Set the new card as the default card for the customer
          const updatedCustomer = await stripe.customers.update(customerId, {
            default_source: customerSource.id,
          });

          const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: currency,
            customer: customerId,
            confirm: true,
            automatic_payment_methods: {
              enabled: true, // Enable automatic payment methods
              allow_redirects: "never", // Avoid redirects
            },
          });

          if (paymentIntent.status === "succeeded") {
            await CardDetails.update({
              paymentId: paymentIntent.id,
              isPaymentDone: true,
            }, {where : {
              cardId: token.card.id,
            }});
            return res.status(HTTP_STATUS_CODE.OK).json({
              status: HTTP_STATUS_CODE.OK,
              message: MESSAGES.PAYMENT_SUCCESSFULL,
              data: {
                customerSource,
                updatedCustomer,
                paymentIntent,
              },
            });
          } else {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
              status: HTTP_STATUS_CODE.BAD_REQUEST,
              message: MESSAGES.YOUR_PAYMENT_FAIELD,
              data: "",
              error: "",
            });
          }
        }

        // If the card already exists, create payment intent directly

        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100,
          currency: currency,
          customer: customerId,
          confirm: true,
          automatic_payment_methods: {
            enabled: true, // Enable automatic payment methods
            allow_redirects: "never", // Avoid redirects
          },
        });
        if (paymentIntent.status === "succeeded") {
          await CardDetails.update({
            paymentId: paymentIntent.id,
            isPaymentDone: true,
          },{where : {
            cardId: token.card.id,
          }});
          return res.status(HTTP_STATUS_CODE.OK).json({
            status: HTTP_STATUS_CODE.OK,
            message: MESSAGES.CARD_ALREADY_EXIST,
            data: {
              paymentIntent,
            },
          });
        } else {
          return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
            status: HTTP_STATUS_CODE.BAD_REQUEST,
            message: MESSAGES.YOUR_PAYMENT_FAIELD,
            data: "",
            error: "",
          });
        }
      }

      // if no customer id then return
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.CUSTOMERID_NOT_EXITS,
        data: {
          paymentIntent,
        },
      });
    } catch (error) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  },
};
