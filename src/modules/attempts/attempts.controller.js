const { Attempt, Quiz, Question, User } = require("../../models");

const startAttempt = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate("questions", "id section type prompt topic difficulty marks options negativeMarks");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Check if quiz is published and within date range
    const now = new Date();
    if (quiz.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Quiz is not published"
      });
    }

    if (quiz.startDate && new Date(quiz.startDate) > now) {
      return res.status(400).json({
        success: false,
        message: "Quiz has not started yet"
      });
    }

    if (quiz.endDate && new Date(quiz.endDate) < now) {
      return res.status(400).json({
        success: false,
        message: "Quiz has ended"
      });
    }

    // Check if user is assigned
    if (!quiz.assignedUsers.includes(req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this quiz"
      });
    }

    // Check if user has already completed this quiz
    const existingAttempt = await Attempt.findOne({
      quiz: quiz._id,
      user: req.user._id,
      status: "completed"
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: "You have already completed this quiz"
      });
    }

    // Create new attempt
    const attempt = await Attempt.create({
      quiz: quiz._id,
      user: req.user._id,
      status: "in_progress",
      startedAt: now
    });

    // Shuffle questions for the attempt
    const shuffledQuestions = [...quiz.questions].sort(() => Math.random() - 0.5);

    res.status(201).json({
      success: true,
      message: "Quiz started successfully",
      data: {
        attemptId: attempt._id,
        quiz: {
          ...quiz.toObject(),
          questions: shuffledQuestions.map(q => ({
            id: q._id,
            section: q.section,
            type: q.type,
            prompt: q.prompt,
            topic: q.topic,
            difficulty: q.difficulty,
            marks: q.marks,
            options: q.options,
            negativeMarks: q.negativeMarks
          }))
        },
        duration: quiz.duration,
        startTime: attempt.startedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

const submitAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId)
      .populate("quiz");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found"
      });
    }

    // Check if attempt belongs to user
    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to submit this attempt"
      });
    }

    // Check if attempt is already completed
    if (attempt.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Attempt already completed"
      });
    }

    // Get quiz with questions for grading
    const quiz = await Quiz.findById(attempt.quiz._id)
      .populate("questions", "id type answer marks negativeMarks");

    const { answers, timeTaken } = req.body;
    attempt.answers = answers;
    attempt.timeTaken = timeTaken || 0;

    // Calculate score
    let totalScore = 0;
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;

    quiz.questions.forEach(question => {
      const userAnswer = answers[question._id.toString()];
      let questionScore = 0;

      if (question.type === "Single Choice" || question.type === "True/False") {
        if (userAnswer === question.answer) {
          questionScore = question.marks;
          correctAnswers++;
        } else {
          questionScore = -question.negativeMarks;
        }
      } else if (question.type === "Multiple Choice") {
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        const correctAnswersList = Array.isArray(question.answer) ? question.answer : [question.answer];
        
        if (userAnswers.length === correctAnswersList.length && 
            userAnswers.every(ans => correctAnswersList.includes(ans))) {
          questionScore = question.marks;
          correctAnswers++;
        } else {
          questionScore = -question.negativeMarks;
        }
      } else if (question.type === "Fill Blank") {
        if (userAnswer && userAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim()) {
          questionScore = question.marks;
          correctAnswers++;
        } else {
          questionScore = -question.negativeMarks;
        }
      } else if (question.type === "Checklist") {
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        const correctAnswersList = Array.isArray(question.answer) ? question.answer : [question.answer];
        
        const matchingAnswers = userAnswers.filter(ans => correctAnswersList.includes(ans));
        questionScore = (matchingAnswers.length / correctAnswersList.length) * question.marks;
        if (matchingAnswers.length === correctAnswersList.length) {
          correctAnswers++;
        }
      }

      totalScore += questionScore;
    });

    attempt.score = Math.max(0, totalScore);
    attempt.percentage = (attempt.score / quiz.maxMarks) * 100;
    attempt.accuracy = (correctAnswers / totalQuestions) * 100;
    attempt.status = "completed";
    attempt.resultStatus = attempt.percentage >= quiz.passPercentage ? "Pass" : "Fail";
    attempt.completedAt = new Date();

    // Calculate rank
    attempt.rank = await attempt.calculateRank();

    await attempt.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    const userAttempts = await Attempt.find({ user: req.user._id, status: "completed" });
    user.completedQuizzes = userAttempts.length;
    user.averageScore = Math.round(userAttempts.reduce((sum, a) => sum + a.percentage, 0) / userAttempts.length);
    await user.save();

    // Update quiz stats
    quiz.completed += 1;
    await quiz.save();

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

const getAttemptById = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.attemptId)
      .populate("quiz", "title category duration passPercentage maxMarks")
      .populate("user", "name email username");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found"
      });
    }

    // Check if user owns the attempt or is admin
    if (attempt.user._id.toString() !== req.user._id.toString() && 
        !["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this attempt"
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};

const getUserAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate("quiz", "title category duration passPercentage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

const getQuizAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ quiz: req.params.quizId })
      .populate("user", "name email username batch")
      .sort({ score: -1, percentage: -1 });

    res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const attempts = await Attempt.find({ 
      quiz: quizId,
      status: "completed"
    })
    .populate("user", "name username batch")
    .sort({ score: -1, percentage: -1, timeTaken: 1 });

    const leaderboard = attempts.map((attempt, index) => ({
      rank: index + 1,
      studentName: attempt.user.name,
      username: attempt.user.username,
      batch: attempt.user.batch,
      score: attempt.score,
      percentage: attempt.percentage,
      status: attempt.resultStatus,
      accuracy: attempt.accuracy,
      timeTaken: attempt.timeTaken
    }));

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startAttempt,
  submitAttempt,
  getAttemptById,
  getUserAttempts,
  getQuizAttempts,
  getLeaderboard
};
