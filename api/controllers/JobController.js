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
const { Op, where } = require("sequelize");
const sendBulkEmail = require("../helpers/mail/sendMail");

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
   * @param {Request} req
   * @param {Response} res
   * @description list all jobs for show to user which job is created
   */
  listJobs: async (req, res) => {
    try {
      //pagination
      let { page, size } = req.body;
      // Convert  to numbers and set defaults
      page = Number(page) || 1; // Default to page 1
      size = Number(size) || 10; // Default page size 10
      // Calculate offset
      let offset = (page - 1) * size;
      let limit = size;

      const allJobs = await Job.findAll({
        where: { isDeleted: false },
        order: [["createdAt", "DESC"]],
        offset: offset,
        limit: limit,
      });

      if (!allJobs) {
        return "No jobs Available";
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
      if (!checkJobId) {
        return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
          status: HTTP_STATUS_CODE.BAD_REQUEST,
          errorCode: "",
          message: MESSAGES.BAD_REQUEST,
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
      const { jobId, userId } = req.body;
      const { error } = validationJobRequest(req.body);
      if (error) {
        console.log(error);
        return res.send(error.details);
      }

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
        await Job.update({ isAccepted: true }, { where: { id: jobId } }); // update isAccepted flag in Job

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
          .filter((applicant) => applicant.isAccepted)
          .map((applicant) => applicant.user.dataValues.email);
        const rejectedEmails = users
          .filter((applicant) => !applicant.isAccepted)
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
   * @description get the user profile using jobId and useId for show the profile of the user to job creater
   */
  userProfileView: async (req, res) => {
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
   * @description get the user profile using jobId and useId for show the profile of the user to job creater
   */
  allUsesInParticularJob: async (req, res) => {
    try {
      const { jobId } = req.body;
      const allJobApplicant = await JobApplicant.findAll({
        where: {
          jobId: jobId,
          isDeleted: false,
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
};


