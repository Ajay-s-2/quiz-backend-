const { Question } = require("../../models");

const getAllQuestions = async (req, res, next) => {
  try {
    const { section, difficulty, type, topic, search } = req.query;
    const filter = { createdBy: req.user._id };

    if (section) filter.section = section;
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (topic) filter.topic = topic;
    if (search) {
      filter.$or = [
        { prompt: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } }
      ];
    }

    const questions = await Question.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    next(error);
  }
};

const createQuestion = async (req, res, next) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user._id
    };

    const question = await Question.create(questionData);

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      data: question
    });
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    // Check if user owns the question
    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this question"
      });
    }

    Object.assign(question, req.body);
    await question.save();

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found"
      });
    }

    // Check if user owns the question
    if (question.createdBy.toString() !== req.user._id.toString() && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this question"
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Question deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
};
