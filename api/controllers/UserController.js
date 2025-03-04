const User = require("../models/User");
const MESSAGES = require("../utils/Messages");
const HTTP_STATUS_CODE = require("../utils/HttpStatusCodes");

const {
  validationLogin,
  validationSignup,
} = require("../helpers/joy/validation");

module.exports = {

  /**
   * @name signup
   * @file UserController.js
   * @param {Request} req
   * @param {Response} res
   * @description User signup using only email password
   */

  signup: async (req, res) => {
    try {
      // validate req.body
    const { error } = validationSignup(req.body);
    if (error) {
      console.log(error);
      return res.send(error.details);
    }
    // take value from the  req.body
    const { email, password } = req.body;

    const payload = {
      email, password
    }

    // check user is already exist or not
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

    // create new user
    const newUser = await User.create(payload);
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
        errorCode: "",
        message: MESSAGES.OK,
        data: "",
        error: "",
    })
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
   * @name login
   * @file UserController.js
   * @param {Request} req
   * @param {Response} res
   * @description User login using only email password
   */
  login: async (req, res) => {
   try {
     // validate req.body
     const { error } = validationLogin(req.body);
     if (error) {
       console.log(error);
       return res.send(error.details);
     }
     // get value from the req.body
     const { email ,password } = req.body;
 
     // find user using email and password
     const user = await User.findAll({where : {email, password}})
     if (user) {
       req.user = user;
       return res.status(HTTP_STATUS_CODE.OK).json({
         status: HTTP_STATUS_CODE.OK,
         errorCode: "",
         message: MESSAGES.OK,
         data: req.user,
         error: "",
       });
     } else {
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
        errorCode: "",
        message: MESSAGES.INTERNAL_SERVER_ERROR,
        data: "",
        error: "",
      });
     }
   } catch (error) {
    
   }
  },
};
