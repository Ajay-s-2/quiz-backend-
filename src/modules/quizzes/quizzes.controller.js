const { Quiz, Question } = require("../../models");

const getAllQuizzes = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = { createdBy: req.user._id };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const quizzes = await Quiz.find(filter)
      .populate("questions", "id section type prompt topic difficulty marks")
      .populate("assignedUsers", "id name email username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("questions", "id section type prompt topic difficulty marks options negativeMarks explanation")
      .populate("createdBy", "id name email");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

const createQuiz = async (req, res, next) => {
  try {
    const quizData = {
      ...req.body,
      createdBy: req.user._id,
      assigned: 0,
      completed: 0
    };

    // Calculate max marks if not provided
    if (req.body.questions && !req.body.maxMarks) {
      const questions = await Question.find({ _id: { $in: req.body.questions } });
      quizData.maxMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    }

    const quiz = await Quiz.create(quizData);

    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate("questions", "id section type prompt topic difficulty marks");

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: populatedQuiz
    });
  } catch (error) {
    next(error);
  }
};

const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Check if user owns the quiz
    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this quiz"
      });
    }

    // Recalculate max marks if questions changed
    if (req.body.questions) {
      const questions = await Question.find({ _id: { $in: req.body.questions } });
      req.body.maxMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate("questions", "id section type prompt topic difficulty marks");

    res.status(200).json({
      success: true,
      data: populatedQuiz
    });
  } catch (error) {
    next(error);
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Check if user owns the quiz
    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this quiz"
      });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

const assignQuizToUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Check if user owns the quiz
    if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to assign this quiz"
      });
    }

    // Add users to assignedUsers (avoid duplicates)
    quiz.assignedUsers = [...new Set([...quiz.assignedUsers.map(id => id.toString()), ...userIds])];
    quiz.assigned = quiz.assignedUsers.length;

    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz assigned successfully",
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

const getAvailableQuizzes = async (req, res, next) => {
  try {
    const now = new Date();
    const quizzes = await Quiz.find({
      status: "published",
      startDate: { $lte: now },
      endDate: { $gte: now },
      assignedUsers: req.user._id
    })
    .populate("questions", "id section type prompt topic difficulty marks")
    .select("id title category description duration passPercentage maxMarks startDate endDate");

    res.status(200).json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  assignQuizToUsers,
  getAvailableQuizzes
};
