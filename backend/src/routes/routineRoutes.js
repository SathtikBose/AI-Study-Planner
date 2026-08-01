const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');
const { generateAIRoutine } = require('../services/geminiService');

router.use(protect);

// @route   POST /api/routine/generate
// @desc    Generate AI study routine based on user's subjects & preferences
// @access  Private
router.post('/generate', async (req, res, next) => {
  try {
    const { dailyHours = 4, excludedDays = [], startDate = new Date() } = req.body;

    const subjects = await Subject.find({ userId: req.user._id });
    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'No subjects found. Please add subjects first.' });
    }

    const preferences = {
      dailyHours: Number(dailyHours),
      excludedDays,
      startDate: new Date(startDate),
    };

    // Call Gemini Service
    const generatedDays = await generateAIRoutine(subjects, preferences);

    // Save routine (Replace previous or create new)
    const routine = await Routine.create({
      userId: req.user._id,
      preferences,
      days: generatedDays,
    });

    const isUsingAI = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');

    res.status(201).json({
      routine,
      isAI: isUsingAI,
      message: isUsingAI 
        ? 'AI Study Routine generated successfully with Gemini'
        : 'Study Routine generated with intelligent local scheduling (Add GEMINI_API_KEY to .env for AI mode)',
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/routine/current
// @desc    Fetch latest active routine for user
// @access  Private
router.get('/current', async (req, res, next) => {
  try {
    const routine = await Routine.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ routine });
  } catch (error) {
    next(error);
  }
});

// @route   PATCH /api/routine/session/:id
// @desc    Toggle study session completion status
// @access  Private
router.patch('/session/:id', async (req, res, next) => {
  try {
    const { completed } = req.body;
    const sessionId = req.params.id;

    const routine = await Routine.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!routine) {
      return res.status(404).json({ message: 'No active routine found' });
    }

    let foundSession = null;
    let targetSubjectId = null;
    let targetTopicName = null;

    // Search for session inside days array
    for (const day of routine.days) {
      const session = day.sessions.id(sessionId);
      if (session) {
        session.completed = completed !== undefined ? completed : !session.completed;
        foundSession = session;
        targetSubjectId = session.subjectId;
        targetTopicName = session.topic;
        break;
      }
    }

    if (!foundSession) {
      return res.status(404).json({ message: 'Study session not found in current routine' });
    }

    await routine.save();

    // Optionally update topic completion status in Subject model
    if (targetSubjectId && targetTopicName) {
      const subject = await Subject.findOne({ _id: targetSubjectId, userId: req.user._id });
      if (subject) {
        const topic = subject.topics.find((t) => t.name.toLowerCase() === targetTopicName.toLowerCase());
        if (topic) {
          topic.completed = foundSession.completed;
          await subject.save();
        }
      }
    }

    res.json({ session: foundSession, routine });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/routine/regenerate
// @desc    Regenerate remaining days routine keeping completed sessions
// @access  Private
router.post('/regenerate', async (req, res, next) => {
  try {
    const currentRoutine = await Routine.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const subjects = await Subject.find({ userId: req.user._id });

    if (!subjects || subjects.length === 0) {
      return res.status(400).json({ message: 'No subjects found to regenerate' });
    }

    const preferences = currentRoutine ? currentRoutine.preferences : {
      dailyHours: 4,
      excludedDays: [],
      startDate: new Date(),
    };

    // Regenerate uncompleted portion
    const newDays = await generateAIRoutine(subjects, preferences);

    const routine = await Routine.create({
      userId: req.user._id,
      preferences,
      days: newDays,
    });

    res.json({
      routine,
      message: 'Routine successfully regenerated for remaining subjects!',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
