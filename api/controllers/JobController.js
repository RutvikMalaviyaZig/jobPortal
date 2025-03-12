const {
  validationCreateJob,
  validationJobApply,
  validationJobRequest,
} = require("../helpers/joy/validation");
const Job = require("../models/Job");
const MESSAGES = require("../utils/Messages");
const HTTP_STATUS_CODE = require("../utils/HttpStatusCodes");
const JobApplicant = require("../models/JobApplicant");
const User = require("../models/User");
const { Op } = require("sequelize");
const sendBulkEmail = require("../helpers/mail/sendMail");
const CardDetails = require("../models/CardDetails");
const sequelize = require("../../config/database");

const { STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY } = process.env;
const stripe = require("stripe")(STRIPE_SECRET_KEY);

module.exports = {
  /**
   * @name createJob
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description create new job using it's all details
   */

  createJob: async (req, res) => {
    try {
      const {
        title,
        startDate,
        endDate,
        amountPerHr,
        startTime,
        endTime,
        jobDescription,
        userId,
      } = req.body;

      const { error } = validationCreateJob(req.body); // validate all fields using joy validator
      if (error) {
        console.log(error);
        return res.send(error.details);
      }

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      const dateDifferenceInDays =
        (endDateObj - startDateObj) / (1000 * 60 * 60 * 24) + 1; // +1 to include both start and end day

      // Calculate total working hours per day
      const totalHoursPerDay = endTime - startTime;

      // Calculate total earnings
      const totalMoney = dateDifferenceInDays * totalHoursPerDay * amountPerHr;

      // create pauload for create job
      const payload = {
        title,
        startDate,
        endDate,
        amountPerHr,
        startTime,
        endTime,
        jobDescription,
        totalAmount: totalMoney,
        createdBy: userId,
      };

      // ceate job using payload
      const newJob = await Job.create(payload);
      return res.status(HTTP_STATUS_CODE.CREATED).json({
        status: HTTP_STATUS_CODE.CREATED,
        errorCode: "",
        message: MESSAGES.CREATED,
        data: newJob,
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

  /**
   * @name listJobs
   * @file JobController.js
   * @param {Request} reqz
   * @param {Response} res
   * @description list all jobs for show to user which job is created
   */
  listJobs: async (req, res) => {
    try {
      // Pagination
      let { page, size } = req.body;
      // Convert to numbers and set defaults
      page = Number(page) || 1; // Default to page 1
      size = Number(size) || 10; // Default page size 10
      // Calculate offset
      let offset = (page - 1) * size;
      let limit = size;

      // const allJobs = await Job.findAll({
      //   where: { isDeleted: false },
      //   order: [["createdAt", "DESC"]],
      //   offset: offset,
      //   limit: limit,
      // });

      // if (!allJobs) {
      //   return "No jobs Available";
      // }

      // Query the job view instead of the Job model
      const allJobs = await sequelize.query(
        'SELECT * FROM job_view ORDER BY "createdAt" DESC LIMIT :limit OFFSET :offset',
        {
          replacements: { limit, offset },
          type: sequelize.QueryTypes.SELECT, // Query type SELECT
        }
      );

      if (!allJobs || allJobs.length === 0) {
        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          errorCode: "",
          message: MESSAGES.JOB_NOT_FOUND,
          data: [],
          error: "",
        });
      }

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: MESSAGES.OK,
        data: allJobs,
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

  /**
   * @name applyForJob
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description  user can apply in job and also do modification if want and apply
   */
  applyForJob: async (req, res) => {
    try {
      const {
        userId,
        startDate,
        endDate,
        amountPerHr,
        startTime,
        endTime,
        jobId,
      } = req.body;
      const { error } = validationJobApply(req.body);
      if (error) {
        console.log(error);
        return res.send(error.details);
      }

      // find job using the jobId
      const checkJobId = await Job.findOne({
        where: {
          [Op.and]: {
            id: jobId,
            isDeleted: false,
          },
        },
      });

      // const checkJobId =  'CALL PROCEDURE check_job_id(jobId)';

      if (!checkJobId) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          errorCode: "",
          message: MESSAGES.JOB_NOT_FOUND,
          data: "",
          error: "",
        });
      }

      if (checkJobId.createdBy == userId) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          errorCode: "",
          message: MESSAGES.YOU_ARE_NOT_ABLE,
          data: "",
          error: "",
        });
      }

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      const dateDifferenceInDays =
        (endDateObj - startDateObj) / (1000 * 60 * 60 * 24) + 1; // +1 to include both start and end day

      // Calculate total working hours per day
      const totalHoursPerDay = endTime - startTime;

      // Calculate total earnings
      const totalMoney = dateDifferenceInDays * totalHoursPerDay * amountPerHr;

      // create pauload for create job
      const payload = {
        userId,
        startDate,
        endDate,
        amountPerHr,
        startTime,
        endTime,
        jobId,
        totalAmount: totalMoney,
      };

      const storeInDB = await JobApplicant.create(payload); // store this apply request in JobApplicant table
      if (!storeInDB) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          errorCode: "",
          message: MESSAGES.BAD_REQUEST,
          data: "",
          error: "",
        });
      }

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: MESSAGES.OK,
        data: storeInDB,
        error: "",
      });
    } catch (error) {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        errorCode: "",
        message: MESSAGES.INTERNAL_SERVER_ERROR,
        data: "",
        error: "",
      });
    }
  },

  /**
   * @name acceptJobRequest
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description createdBy user accept the job request using userid, jobid
   */
  acceptJobRequest: async (req, res) => {
    try {
      const { jobId, userId, creatorId } = req.body;
      const { error } = validationJobRequest(req.body);
      if (error) {
        console.log(error);
        return res.send(error.details);
      }

      const checkCratedBy = await Job.findOne({
        where: { createdBy: creatorId },
      });
      if (checkCratedBy) {
        const checkJobIdInDb = await Job.findOne({ where: { id: jobId } });
        if (checkJobIdInDb) {
          const user = await JobApplicant.findOne({
            where: {
              [Op.and]: [{ jobId }, { userId }],
            },
          });
          if (!user) {
            return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
              status: HTTP_STATUS_CODE.BAD_REQUEST,
              errorCode: "",
              message: MESSAGES.BAD_REQUEST,
              data: "",
              error: "",
            });
          }

          await JobApplicant.update(
            { jobStatus: "Accepted" },
            { where: { [Op.and]: [{ jobId }, { userId }] } } // update isAccepted flag in JobApplicant
          );
          await JobApplicant.update(
            { jobStatus: "Rejected" },
            {
              where: {
                [Op.and]: [
                  { jobId: jobId }, // jobId should be equal to the given jobId
                  { userId: { [Op.ne]: userId } }, // userId should not be equal to the given userId
                ],
              },
            }
          );
          const jobDone = await Job.update(
            { isAccepted: true },
            { where: { id: jobId } }
          ); // update isAccepted flag in Job

          const users = await JobApplicant.findAll({
            // find all user for send mail
            where: { jobId },
            include: [
              {
                model: Job,
                required: true,
              },
              {
                model: User,
                attributes: ["email"],
              },
            ],
          });

          const acceptedEmails = users
            .filter((applicant) => applicant.jobStatus == "Accepted")
            .map((applicant) => applicant.user.dataValues.email);

          const rejectedEmails = users
            .filter((applicant) => applicant.jobStatus == "Rejected")
            .map((applicant) => applicant.user.dataValues.email);

          // Email content
          const subject = MESSAGES.MAIL_STATUS;
          const textAccepted = MESSAGES.MAIL_FOR_ACCEPTED;
          const textRejected = MESSAGES.MAIL_FOR_REJECTED;

          // Send emails to accepted applicants
          if (acceptedEmails.length > 0) {
            sendBulkEmail(acceptedEmails, subject, textAccepted)
              .then((info) => {
                console.log(
                  `Bulk email sent to accepted applicants: ${info.response}`
                );
              })
              .catch((error) => {
                console.error(
                  "Error sending bulk email to accepted applicants:",
                  error
                );
              });
          }

          // Send emails to rejected applicants
          if (rejectedEmails.length > 0) {
            sendBulkEmail(rejectedEmails, subject, textRejected)
              .then((info) => {
                console.log(
                  `Bulk email sent to rejected applicants: ${info.response}`
                );
              })
              .catch((error) => {
                console.error(
                  "Error sending bulk email to rejected applicants:",
                  error
                );
              });
          }
          return res.status(HTTP_STATUS_CODE.OK).json({
            status: HTTP_STATUS_CODE.OK,
            errorCode: "",
            message: MESSAGES.JOB_ACCEPTED,
            data: jobDone,
            error: "",
          });
        }
      }
      return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
        status: HTTP_STATUS_CODE.UNAUTHORIZED,
        errorCode: "",
        message: MESSAGES.YOU_ARE_NOT_ABLE_TO_ACCEPT_IT,
        data: "",
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

  /**
   * @name updateJob
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description update the job detalis if job createdBy user want
   */
  updateJob: async (req, res) => {
    try {
      const {
        userId,
        jobId,
        title,
        startDate,
        endDate,
        amountPerHr,
        startTime,
        endTime,
        jobDescription,
      } = req.body;

      const findJob = await Job.findAll({
        where: {
          [Op.and]: [
            { id: jobId },
            { createdBy: userId },
            { isDeleted: false },
            { isAccepted: false },
          ],
        },
      });
      if (findJob) {
        // if valid then update the job data
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        const dateDifferenceInDays =
          (endDateObj - startDateObj) / (1000 * 60 * 60 * 24) + 1; // +1 to include both start and end day

        // Calculate total working hours per day
        const totalHoursPerDay = endTime - startTime;

        // Calculate total earnings
        const totalMoney =
          dateDifferenceInDays * totalHoursPerDay * amountPerHr;

        // Prepare updated values
        const updatedValue = {
          title,
          startDate,
          endDate,
          amountPerHr,
          startTime,
          endTime,
          jobDescription,
          totalAmount: totalMoney,
        };
        // ceate job using payload
        await Job.update(updatedValue, {
          where: { id: jobId },
        });

        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          errorCode: "",
          message: MESSAGES.JOB_UPDATED,
          data: updatedValue,
          error: "",
        });
      } else {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          errorCode: "",
          message: MESSAGES.BAD_REQUEST,
          data: "",
          error: "",
        });
      }
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

  /**
   * @name deleteJob
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description delete the job using jobId and userId and check createdBy is userId
   */
  deleteJob: async (req, res) => {
    try {
      const { jobId, userId } = req.body;
      const findJob = await Job.findOne({
        where: { [Op.and]: [{ id: jobId }, { createdBy: userId }] },
      });
      if (!findJob) {
        return res.status(HTTP_STATUS_CODE.UNAUTHORIZED).json({
          status: HTTP_STATUS_CODE.UNAUTHORIZED,
          errorCode: "",
          message: MESSAGES.UNAUTHORIZED,
          data: "",
          error: "",
        });
      }
      if (findJob.isDeleted == false) {
        await Job.update(
          { isDeleted: true },
          { where: { id: jobId, createdBy: userId } }
        );
        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          errorCode: "",
          message: MESSAGES.JOB_DELETE_SUCCESSFULLY,
          data: "",
          error: "",
        });
      }
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

  /**
   * @name userProfileView
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description view the perticular user profile
   */
  userProfileViewInJob: async (req, res) => {
    try {
      const { userId, jobId } = req.body;
      const checkUserIdInDb = await JobApplicant.findOne({
        where: {
          [Op.and]: {
            jobId: jobId,
            userId: userId,
          },
        },
      });

      const userIdForProfile = checkUserIdInDb.dataValues.userId;
      if (checkUserIdInDb) {
        const userdetail = await User.findOne({
          where: { id: userIdForProfile },
          attributes: ["email"],
        });
        return res.status(HTTP_STATUS_CODE.OK).json({
          status: HTTP_STATUS_CODE.OK,
          errorCode: "",
          message: MESSAGES.USER_PROFILE,
          data: userdetail,
          error: "",
        });
      }
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

  /**
   * @name allUsesInParticularJob
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description get the all user which applyied in particularjob
   */
  allUsesInParticularJob: async (req, res) => {
    try {
      const { jobId } = req.body;
      // const allJobApplicant = await JobApplicant.findAll({
      //   where: {
      //     jobId: jobId,
      //   },
      // });
      // added view
      const allJobApplicant = await sequelize.query(
        'SELECT * FROM JobApplicantView WHERE "jobId" = "jobId"',
        {
          replacements: { jobId },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: MESSAGES.OK,
        data: allJobApplicant,
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

  /**
   * @name viewJobDetails
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description view the particular job details
   */

  viewJobDetails: async (req, res) => {
    try {
      const { jobId } = req.body;
      const findJobDetails = await Job.findOne({
        where: {
          [Op.and]: {
            id: jobId,
            isDeleted: false,
          },
        },
      });
      if (!findJobDetails) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          errorCode: "",
          message: MESSAGES.JOB_NOT_FOUND,
          data: "",
          error: "",
        });
      }
      // const findJobDetails =  'CALL PROCEDURE check_job_id("jobId")';
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: MESSAGES.GET_JOB_DETAILS_SUCCESSFULLY,
        data: findJobDetails,
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

  /**
   * @name viweJobsWhereUserApplied
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description view all jobs where user is applyed
   */

  viweJobsWhereUserApplied: async (req, res) => {
    try {
      const { userId } = req.body;
      const allJobApplicant = await JobApplicant.findAll({
        where: {
          userId: userId,
        },
      });

      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: MESSAGES.OK,
        data: allJobApplicant,
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

  /**
   * @name jobPayment
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description pay money to user on last date based on total amount and total Work Day
   */
  jobPayment: async (req, res) => {
    try {
      const { jobId, userId, totalWorkedDay, currency } = req.body;

      const jobIdCheckInJob = await Job.findOne({ where: { id: jobId } });
      if (!jobIdCheckInJob) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          errorCode: "",
          message: MESSAGES.JOB_NOT_FOUND,
          data: "",
          error: "",
        });
      }

      const userIdCheckIndUser = await User.findOne({ where: { id: userId } });
      if (!userIdCheckIndUser) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          errorCode: "",
          message: MESSAGES.USER_NOT_FOUND,
          data: "",
          error: "",
        });
      }

      const jobStatus = "Accepted";
      const checkInJobApplicant = await JobApplicant.findOne({
        where: {
          [Op.and]: [
            { jobId: jobId },
            { userId: userId },
            { jobStatus: jobStatus },
          ],
        },
      });

      const endDate = new Date(checkInJobApplicant.endDate);
      const amountPerHr = checkInJobApplicant.amountPerHr;
      const totalTimePerDay =
        checkInJobApplicant.endTime - checkInJobApplicant.startTime;

      const totalAmount = totalWorkedDay * totalTimePerDay * amountPerHr;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (today.toDateString() === endDate.toDateString()) {
        // Create Stripe PaymentIntent
        const checkCustomerId = await userIdCheckIndUser.stripeCustomerId;

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
              checkCustomerId,
              {
                source: token.id,
              }
            );

            // Set the new card as the default card for the customer
            const updatedCustomer = await stripe.customers.update(
              checkCustomerId,
              {
                default_source: customerSource.id,
              }
            );
            const paymentIntent = await stripe.paymentIntents.create({
              amount: totalAmount * 100,
              currency: currency,
              customer: checkCustomerId,
              confirm: true,
              automatic_payment_methods: {
                enabled: true, // Enable automatic payment methods
                allow_redirects: "never", // Avoid redirects
              },
            });

            if (paymentIntent.status === "succeeded") {
              await CardDetails.update(
                {
                  paymentId: paymentIntent.id,
                  isPaymentDone: true,
                },
                {
                  where: {
                    cardId: token.card.id,
                  },
                }
              );

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
            amount: totalAmount * 100,
            currency: currency,
            customer: checkCustomerId,
            confirm: true,
            automatic_payment_methods: {
              enabled: true, // Enable automatic payment methods
              allow_redirects: "never", // Avoid redirects
            },
          });
          if (paymentIntent.status == "succeeded") {
            await CardDetails.update(
              {
                paymentId: paymentIntent.id,
                isPaymentDone: true,
              },
              {
                where: {
                  cardId: token.card.id,
                },
              }
            );

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
      }

      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        message: MESSAGES.BAD_REQUEST,
        data: "",
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
};
