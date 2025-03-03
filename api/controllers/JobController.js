const { validationCreateJob, validationJobApply, validationJobRequest } = require("../helpers/joy/validation");
const Job = require("../models/Job");
const MESSAGES = require("../utils/Messages");
const HTTP_STATUS_CODE = require("../utils/HttpStatusCodes");
const JobApplicant = require("../models/JobApplicant");
const { Op } = require("sequelize");

module.exports = {
  createJob: async (req, res) => {
    const { error } = validationCreateJob(req.body);
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

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    const dateDifferenceInDays = (endDateObj - startDateObj) / (1000 * 60 * 60 * 24) + 1; // +1 to include both start and end day

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
  },

  listJobs: async (req, res) => {
    const allJobs = await Job.findAll();
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
  },


  applyForJob: async (req, res) => {
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

    const jobId = req.query.jobId

    const checkJobId = await Job.findOne({ where: { id: jobId } })
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

    const dateDifferenceInDays = (endDateObj - startDateObj) / (1000 * 60 * 60 * 24) + 1; // +1 to include both start and end day

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

    const storeInDB = await JobApplicant.create(payload)
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
  },

  acceptJobRequest: async () => {
    const { error } = validationJobRequest(req.body);
    if (error) {
      console.log(error);
      return res.send(error.details);
    }
    const { jobId, userId } = req.body;

    const user = await JobApplicant.findOne({
      where: {
        [Op.and]: [{ jobId }, { userId }],
      }
    })

    if (!user) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        errorCode: "",
        message: MESSAGES.BAD_REQUEST,
        data: "",
        error: "",
      });
    }
    
  }


};
