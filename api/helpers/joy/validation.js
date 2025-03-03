const Joi = require('joi')

const validator = (schema) => (payload) => schema.validate(payload,{abortEarly : false})

const signupSchema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string(),
})  

const loginSchema = Joi.object({
    email: Joi.string().email()
})

const createJobValidation = Joi.object({
    title : Joi.string(),
    startDate : Joi.date(),
    endDate : Joi.date(),
    amountPerHr : Joi.number(),
    startTime : Joi.number(),
    endTime : Joi.number(),
    jobDescription : Joi.string(),
    totalAmount : Joi.string(),
})

exports.validationSignup = validator(signupSchema)
exports.validationLogin = validator(loginSchema)
exports.validationCreateJob = validator(createJobValidation)