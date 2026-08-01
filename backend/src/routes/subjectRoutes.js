const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');

// Apply protection to all subject routes
router.use(protect);

// @route   GET /api/subjects
// @desc    Get all subjects for logged-in user
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id }).sort({ examDate: 1 });
    res.json({ subjects });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/subjects
// @desc    Create a new subject
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const { name, examDate, topics } = req.body;

    if (!name || !examDate) {
      return res.status(400).json({ message: 'Subject name and exam date are required' });
    }

    const parsedExamDate = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(parsedExamDate.getTime())) {
      return res.status(400).json({ message: 'Invalid exam date format' });
    }

    if (parsedExamDate < today) {
      return res.status(400).json({ message: 'Exam date must be today or in the future' });
    }

    const formattedTopics = Array.isArray(topics)
      ? topics.map((t) => (typeof t === 'string' ? { name: t } : t))
      : [];

    const subject = await Subject.create({
      userId: req.user._id,
      name,
      examDate: parsedExamDate,
      topics: formattedTopics,
    });

    res.status(201).json({ subject });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update a subject
// @access  Private
router.put('/:id', async (req, res, next) => {
  try {
    const { name, examDate, topics } = req.body;
    let subject = await Subject.findOne({ _id: req.params.id, userId: req.user._id });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    if (examDate) {
      const parsedExamDate = new Date(examDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(parsedExamDate.getTime())) {
        return res.status(400).json({ message: 'Invalid exam date format' });
      }
      if (parsedExamDate < today) {
        return res.status(400).json({ message: 'Exam date must be today or in the future' });
      }
      subject.examDate = parsedExamDate;
    }

    if (name) subject.name = name;
    if (topics) {
      subject.topics = Array.isArray(topics)
        ? topics.map((t) => (typeof t === 'string' ? { name: t } : t))
        : subject.topics;
    }

    await subject.save();

    res.json({ subject });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete a subject
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
