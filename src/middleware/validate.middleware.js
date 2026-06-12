const Joi = require("joi");

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    // Replace req.body with validated value
    req.body = value;
    if (typeof next === 'function') {
      next();
    } else {
      console.error('next is not a function in validate middleware');
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().allow('', null),
    username: Joi.string().required(),
    role: Joi.string().valid("SUPER_ADMIN", "ADMIN", "USER").default("USER")
  }),

  login: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  }),

  createQuestion: Joi.object({
    section: Joi.string().valid("Aptitude", "Reasoning", "Technical", "Programming").required(),
    type: Joi.string().valid("Single Choice", "Multiple Choice", "Fill Blank", "True/False", "Checklist").required(),
    prompt: Joi.string().required(),
    topic: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).allow(null),
    difficulty: Joi.string().valid("Easy", "Medium", "Hard").default("Medium"),
    marks: Joi.number().required(),
    negativeMarks: Joi.number().default(0),
    options: Joi.array().items(Joi.string()).allow(null),
    answer: Joi.required(),
    explanation: Joi.string().allow('', null)
  }),

  createQuiz: Joi.object({
    title: Joi.string().required(),
    category: Joi.string().required(),
    description: Joi.string().allow('', null),
    duration: Joi.number().required(),
    passPercentage: Joi.number().required(),
    maxMarks: Joi.number().required(),
    questions: Joi.array().items(Joi.string()).allow(null),
    startDate: Joi.date().allow(null),
    endDate: Joi.date().allow(null)
  }),

  updateQuiz: Joi.object({
    title: Joi.string(),
    category: Joi.string(),
    description: Joi.string().allow('', null),
    duration: Joi.number(),
    passPercentage: Joi.number(),
    maxMarks: Joi.number(),
    questions: Joi.array().items(Joi.string()).allow(null),
    status: Joi.string().valid("draft", "published"),
    startDate: Joi.date().allow(null),
    endDate: Joi.date().allow(null)
  }),

  submitAttempt: Joi.object({
    answers: Joi.object().required(),
    timeTaken: Joi.number().allow(null)
  })
};

module.exports = { validate, schemas };
