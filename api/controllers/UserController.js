const User = require("../models/User");
const MESSAGES = require("../utils/Messages");
const HTTP_STATUS_CODE = require("../utils/HttpStatusCodes");

const {
  validationLogin,
  validationSignup,
} = require("../helpers/joy/validation");

module.exports = {
  signup: async (req, res) => {
    const { error } = validationSignup(req.body);
    if (error) {
      console.log(error);
      return res.send(error.details);
    }
    const { email, password } = req.body;

    const payload = {
      email, password
    }

    const existEmail = await User.findOne({ where: { email } });
    if (existEmail) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        errorCode: "",
        message: MESSAGES.EMAIL_ALREADY_EXIST,
        data: "",
        error: "",
      });
    }

    const newUser = await User.create(payload);
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: MESSAGES.OK,
        data: newUser,
        error: "",
    })
  },

  login: async (req, res) => {
    const { error } = validationLogin(req.body);
    if (error) {
      console.log(error);
      return res.send(error.details);
    }

    const { email } = req.body;

    const user = await User.findAll({where : {email}})
    console.log(user);
    if (user) {
      req.user = user;
      return res.status(HTTP_STATUS_CODE.OK).json({
        status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: MESSAGES.OK,
        data: "",
        error: "",
      });
    } else {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        status: HTTP_STATUS_CODE.BAD_REQUEST,
        errorCode: "",
        message: MESSAGES.PLZ_SIGNUP_LOGIN,
        data: "",
        error: "",
      });
    }
  },
};
