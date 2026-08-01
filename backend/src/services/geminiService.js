const z = require('zod');

// Schema validation for Gemini routine output
const SessionSchema = z.object({
  subjectName: z.string(),
  topic: z.string(),
  durationMinutes: z.number().positive(),
});

const DayPlanSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  sessions: z.array(SessionSchema),
});

const RoutineOutputSchema = z.array(DayPlanSchema);

/**
 * Heuristic study plan generator used when GEMINI_API_KEY is missing or API call fails.
 */
function generateFallbackRoutine(subjects, preferences) {
  const { dailyHours = 4, excludedDays = [], startDate = new Date() } = preferences;
  const start = new Date(startDate);
  
  // Collect all uncompleted topics
  const topicPool = [];
  subjects.forEach(sub => {
    const uncompletedTopics = sub.topics.filter(t => !t.completed);
    uncompletedTopics.forEach(top => {
      topicPool.push({
        subjectId: sub._id,
        subjectName: sub.name,
        examDate: new Date(sub.examDate),
        topic: top.name,
        difficulty: top.difficulty || 'Medium',
      });
    });
  });

  // Sort topics by earliest exam date first
  topicPool.sort((a, b) => a.examDate - b.examDate);

  const days = [];
  let currentDate = new Date(start);
  const totalMinutesPerDay = dailyHours * 60;
  const maxDays = 60;
  let dayCount = 0;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  while (topicPool.length > 0 && dayCount < maxDays) {
    const dayName = dayNames[currentDate.getDay()];
    
    if (!excludedDays.includes(dayName)) {
      let remainingMinutesToday = totalMinutesPerDay;
      const sessionsToday = [];

      while (topicPool.length > 0 && remainingMinutesToday >= 30) {
        const item = topicPool.shift();
        const duration = Math.min(60, remainingMinutesToday);
        
        sessionsToday.push({
          subjectId: item.subjectId,
          subjectName: item.subjectName,
          topic: item.topic,
          durationMinutes: duration,
          completed: false,
        });

        remainingMinutesToday -= duration;
      }

      if (sessionsToday.length > 0) {
        days.push({
          date: new Date(currentDate),
          sessions: sessionsToday,
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
    dayCount++;
  }

  return days;
}

/**
 * Generate AI study routine using Gemini API
 */
async function generateAIRoutine(subjects, preferences) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.warn('GEMINI_API_KEY not configured in .env. Using fallback study schedule algorithm.');
    return generateFallbackRoutine(subjects, preferences);
  }

  const promptData = {
    today: new Date().toISOString().split('T')[0],
    preferences: {
      dailyHours: preferences.dailyHours || 4,
      excludedDays: preferences.excludedDays || [],
      startDate: preferences.startDate ? new Date(preferences.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
    subjects: subjects.map(s => ({
      id: s._id,
      name: s.name,
      examDate: new Date(s.examDate).toISOString().split('T')[0],
      topics: s.topics.filter(t => !t.completed).map(t => ({ name: t.name, difficulty: t.difficulty })),
    })),
  };

  const systemInstruction = `You are an expert AI Study Routine Generator. 
Given subjects, their topics, upcoming exam dates, and preferences (daily study hours: ${promptData.preferences.dailyHours}h, excluded days: ${JSON.stringify(promptData.preferences.excludedDays)}), generate a day-by-day study schedule.
Output MUST be raw valid JSON matching this schema format:
[
  {
    "date": "YYYY-MM-DD",
    "sessions": [
      {
        "subjectName": "Mathematics",
        "topic": "Derivatives",
        "durationMinutes": 60
      }
    ]
  }
]
Do not wrap in backticks or markdown if possible, return strictly valid JSON array only.`;

  const prompt = `${systemInstruction}\n\nStudent Data:\n${JSON.stringify(promptData, null, 2)}`;

  let retries = 2;
  while (retries > 0) {
    try {
      let responseText = '';

      // Try Google Generative AI
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } });
      const result = await model.generateContent(prompt);
      responseText = result.response.text();

      // Clean JSON formatting if enclosed in code blocks
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanJson);

      // Validate schema
      const validated = RoutineOutputSchema.parse(parsedData);

      const subjectMap = new Map(subjects.map(s => [s.name.toLowerCase(), s._id]));

      return validated.map(dayObj => ({
        date: new Date(dayObj.date),
        sessions: dayObj.sessions.map(sess => ({
          subjectId: subjectMap.get(sess.subjectName.toLowerCase()) || null,
          subjectName: sess.subjectName,
          topic: sess.topic,
          durationMinutes: sess.durationMinutes,
          completed: false,
        })),
      }));
    } catch (err) {
      console.error(`Gemini Generation Attempt Failed (${retries} retries left):`, err.message);
      retries--;
      if (retries === 0) {
        console.warn('Gemini API retries exhausted. Falling back to heuristic planner.');
        return generateFallbackRoutine(subjects, preferences);
      }
    }
  }

  return generateFallbackRoutine(subjects, preferences);
}

module.exports = {
  generateAIRoutine,
  generateFallbackRoutine,
};
