const Joi = require("joi");

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string(),
    username: Joi.string().required(),
    role: Joi.string().valid("SUPER_ADMIN", "ADMIN", "USER").default("USER")
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createQuestion: Joi.object({
    section: Joi.string().valid("Aptitude", "Reasoning", "Technical", "Programming").required(),
    type: Joi.string().valid("Single Choice", "Multiple Choice", "Fill Blank", "True/False", "Checklist").required(),
    prompt: Joi.string().required(),
    topic: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    difficulty: Joi.string().valid("Easy", "Medium", "Hard").default("Medium"),
    marks: Joi.number().required(),
    negativeMarks: Joi.number().default(0),
    options: Joi.array().items(Joi.string()),
    answer: Joi.required(),
    explanation: Joi.string()
  }),

  createQuiz: Joi.object({
    title: Joi.string().required(),
    category: Joi.string().required(),
    description: Joi.string(),
    duration: Joi.number().required(),
    passPercentage: Joi.number().required(),
    maxMarks: Joi.number().required(),
    questions: Joi.array().items(Joi.string()),
    startDate: Joi.date(),
    endDate: Joi.date()
  }),

  updateQuiz: Joi.object({
    title: Joi.string(),
    category: Joi.string(),
    description: Joi.string(),
    duration: Joi.number(),
    passPercentage: Joi.number(),
    maxMarks: Joi.number(),
    questions: Joi.array().items(Joi.string()),
    status: Joi.string().valid("draft", "published"),
    startDate: Joi.date(),
    endDate: Joi.date()
  }),

  submitAttempt: Joi.object({
    answers: Joi.object().required(),
    timeTaken: Joi.number()
  })
};

module.exports = { validate, schemas };
