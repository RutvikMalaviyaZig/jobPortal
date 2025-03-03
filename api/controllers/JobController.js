const { validationCreateJob } = require("../helpers/joy/validation");
const Job = require("../models/Job");
const MESSAGES = require("../utils/Messages");
const HTTP_STATUS_CODE = require("../utils/HttpStatusCodes");

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

    const dateDifferenceInMs = endDateObj - startDateObj;

    // count total money
    const totalMoney =
      (dateDifferenceInMs / (1000 * 60 * 60)) *
      (endTime - startTime) *
      amountPerHr;

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
    console.log(newJob);
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
        data: newJob,
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
};
