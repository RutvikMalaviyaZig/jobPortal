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
const AcceptedJob = require("../models/AcceptedJob");
const sendEmail = require("../helpers/mail/sendMail");

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
    const { error } = validationCreateJob(req.body); // validate all fields using joy validator
    if (error) {
      console.log(error);
      return res.send(error.details);
    }

    const {
      title,
      startDate,
      endDate,
      amountPerHr,
      startTime,
      endTime,
      jobDescription,
      isAccepted,
    } = req.body;
    const userId = req.query.userId; 
    if (!userId) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        errorCode: "",
        message: MESSAGES.BAD_REQUEST,
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
      title,
      startDate,
      endDate,
      amountPerHr,
      startTime,
      endTime,
      jobDescription,
      totalAmount: totalMoney,
      isAccepted,
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
      message: MESSAGES.INTERNAL_SERVER_ERROR,
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
   * @description list all jobs 
   */
  listJobs: async (req, res) => {
    try {
      const allJobs = await Job.findAll(); // find all job 
    if (!allJobs) {
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
      data: allJobs,
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
   * @name applyForJob
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description  user can apply in job and also do modification if want and apply
   */
  applyForJob: async (req, res) => {
   try {
    const { error } = validationJobApply(req.body);
    if (error) {
      console.log(error);
      return res.send(error.details);
    }
    const {
      userId,
      title,
      startDate,
      endDate,
      amountPerHr,
      startTime,
      endTime,
      jobDescription,
      isAccepted,
    } = req.body;

    const jobId = req.query.jobId;
    // find job using the jobId
    const checkJobId = await Job.findOne({ where: { id: jobId } });
    if (!checkJobId) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        errorCode: "",
        message: MESSAGES.BAD_REQUEST,
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
      title,
      userId,
      startDate,
      endDate,
      amountPerHr,
      startTime,
      endTime,
      jobDescription,
      jobId,
      totalAmount: totalMoney,
      isAccepted,
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
   * @description createdBy user accept the job request using userid, jobid, startDate and endDate
   */
  acceptJobRequest: async (req, res) => {
  try {
    const { error } = validationJobRequest(req.body);
    if (error) {
      console.log(error);
      return res.send(error.details);
    }
    const { jobId, userId, startDate, endDate } = req.body;

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
      { isAccepted: true },
      { where: { [Op.and]: [{ jobId }, { userId }] } }  // update isAccepted flag in JobApplicant
    );
    await Job.update({ isAccepted: true }, { where: { id: jobId } }); // update isAccepted flag in Job
    const payload = {
      userId,
      jobId,
      startDate,
      endDate,
    };
    const saveInAcpJob = await AcceptedJob.create(payload); // store this in the AcceptedJob 
    if (!saveInAcpJob) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        errorCode: "",
        message: MESSAGES.BAD_REQUEST,
        data: "",
        error: "",
      });
    }

    const users = await JobApplicant.findAll({ // find all user for send mail
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

    // take email of user check flag and send mail related to flag
    for (const applicant of users) {
      const email = applicant.user.dataValues.email;
      const subject = applicant.isAccepted
        ? "Job Application Accepted"
        : "Job Application Rejected";
      const text = applicant.isAccepted
        ? "Congratulations! You have been selected for the job."
        : "We regret to inform you that your application was not selected.";
      try {
        // Send the email
        await sendEmail(email, subject, text);
        console.log(`Email sent to: ${email}`);
      } catch (error) {
        console.error("Error sending email to:", email, error);
      }
    }

    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      errorCode: "",
      message: MESSAGES.OK,
      data: saveInAcpJob,
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
   * @name updateJob
   * @file JobController.js
   * @param {Request} req
   * @param {Response} res
   * @description update the job detalis if job createdBy user want
   */
  updateJob: async (req, res) => {
  try {
    const {
      jobId,
      title,
      startDate,
      endDate,
      amountPerHr,
      startTime,
      endTime,
      jobDescription,
      isAccepted,
    } = req.body;
    const createdBy = req.query.userId;
    if (createdBy) {
      const findJob = await Job.findAll({  // find job bu jobId and createdBy 
        where: { [Op.and]: [{ id: jobId }, { createdBy }] },
      });
      if (findJob) { // if valid then update the job data 
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
          isAccepted,
          createdBy,
        };
        // ceate job using payload
        await Job.update(updatedValue, {
          where: { id: jobId },
        });

        return res.status(HTTP_STATUS_CODE.CREATED).json({
          status: HTTP_STATUS_CODE.CREATED,
          errorCode: "",
          message: MESSAGES.CREATED,
          data: updatedValue,
          error: "",
        });
      }
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
      message: MESSAGES.INTERNAL_SERVER_ERROR,
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

    await Job.destroy({ where: { id: jobId, createdBy: userId } });
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      errorCode: "",
      message: MESSAGES.JOB_DELETE_SUCCESSFULLY,
      data: "",
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
};
