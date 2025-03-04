const Joi = require('joi')

const validator = (schema) => (payload) => schema.validate(payload,{abortEarly : false})

const signupSchema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string(),
})  

const loginSchema = Joi.object({
    email: Joi.string().email(),
    password : Joi.string()
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

const applyJob = Joi.object({
    userId : Joi.string(),
    title : Joi.string(),
    startDate : Joi.date(),
    endDate : Joi.date(),
    amountPerHr : Joi.number(),
    startTime : Joi.number(),
    endTime : Joi.number(),
    jobDescription : Joi.string(),
    totalAmount : Joi.string(),
    isAccepted : Joi.boolean()
})

const jobReqValidstion = Joi.object({
    jobId : Joi.string(),
    userId : Joi.string(),
   startDate : Joi.date(),
    endDate : Joi.date()
})



exports.validationSignup = validator(signupSchema)
exports.validationLogin = validator(loginSchema)
exports.validationCreateJob = validator(createJobValidation)
exports.validationJobApply = validator(applyJob)
exports.validationJobRequest = validator(jobReqValidstion)