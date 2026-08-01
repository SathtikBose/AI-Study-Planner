# Product Requirements Document (PRD)
## AI Study Planner

---

## 1. Overview

**Product Name:** AI Study Planner

**One-line description:** A web app where students enter their subjects, exam dates, and topics, and an AI (Gemini) generates a personalized day-wise study routine that can be downloaded as a PDF.

**Target Users:** Students preparing for exams (school, college, competitive) who need help organizing study time across multiple subjects.

**Core Value Proposition:** Turns a messy list of subjects/topics/deadlines into a structured, realistic daily study schedule — automatically, using AI — and lets the student take it offline as a PDF.

---

## 2. Goals

- Let a user add subjects, each with an exam date and list of topics
- Generate an AI-powered, day-wise study routine based on that data
- Present the routine in a clean, minimal, responsive calendar/list UI
- Allow the user to download the generated routine as a PDF
- Keep the tech stack basic and maintainable (no over-engineering)

### Non-Goals (for v1)
- No collaborative/shared study plans
- No real-time chat or social features
- No mobile app (web-only, responsive)
- No payment/subscription system

---

## 3. User Flow

1. **Sign up / Log in** (email + password, JWT-based)
2. **Add Subjects** — for each subject: name, exam date, list of topics (topic name + optional estimated difficulty)
3. **Set Preferences** — daily available study hours, preferred study days (e.g. exclude Sundays), start date
4. **Generate Routine** — user clicks "Generate My Routine" → backend calls Gemini API → returns a day-wise plan (date → subject → topics → duration)
5. **View Routine** — clean calendar/list view, grouped by day, with progress checkboxes
6. **Download PDF** — user clicks "Download Routine" → PDF generated and downloaded
7. **Track Progress** — mark sessions/topics as complete; completed items reflected visually
8. **Regenerate** (optional/stretch) — if behind schedule, regenerate remaining days factoring in what's already done

---

## 4. Features (v1 Scope)

### 4.1 Authentication
- Register / Login / Logout
- JWT stored in httpOnly cookie or localStorage
- Protected routes on frontend and backend

### 4.2 Subject & Topic Management
- Add / edit / delete subject
- Each subject: `name`, `examDate`, `topics: [{ name, completed }]`
- Validation: exam date must be in the future

### 4.3 Routine Generation (Gemini)
- Input to Gemini: all subjects, their topics, exam dates, today's date, daily available hours, excluded days
- Gemini returns **strict JSON**: array of `{ date, sessions: [{ subject, topic, durationMinutes }] }`
- Backend validates JSON shape before saving; retries once on malformed response
- Store generated routine in MongoDB tied to the user

### 4.4 Routine Display
- Clean, minimal calendar or day-list view (today highlighted)
- Each day expandable to show sessions
- Checkbox to mark a session complete
- Progress bar per subject (topics completed / total)

### 4.5 PDF Download
- "Download Routine" button exports the current routine as a PDF
- PDF includes: student name, date range, day-wise table of subject/topic/duration
- Client-side generation (no server round-trip needed) using a lightweight library

### 4.6 UI/UX Requirements
- Clean, minimal, modern aesthetic (generous whitespace, one accent color, clear typography hierarchy)
- Fully responsive: mobile, tablet, desktop
- Smooth transitions/animations on routine generation and view switching (subtle, not flashy)
- Loading states for AI generation (this can take a few seconds — show a clear "Generating your routine..." state)
- Empty states (no subjects yet, no routine yet) with clear calls to action

---

## 5. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| AI | Gemini API |
| PDF Generation | Client-side (jsPDF + jspdf-autotable) |
| Auth | JWT + bcrypt |
| Deployment | Frontend on Vercel, Backend on Render |

Note: Cloudinary and image upload are **not required** for this scope, since input is text-based (subjects/topics/dates) rather than image uploads. If a future version adds "scan your timetable" via photo, Cloudinary + Gemini vision would be added then.

---

## 6. Data Models

### User
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Subject
```
{
  userId: ObjectId,
  name: String,
  examDate: Date,
  topics: [
    { name: String, completed: Boolean }
  ],
  createdAt: Date
}
```

### Routine
```
{
  userId: ObjectId,
  generatedAt: Date,
  preferences: {
    dailyHours: Number,
    excludedDays: [String],
    startDate: Date
  },
  days: [
    {
      date: Date,
      sessions: [
        {
          subjectId: ObjectId,
          subjectName: String,
          topic: String,
          durationMinutes: Number,
          completed: Boolean
        }
      ]
    }
  ]
}
```

---

## 7. API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/subjects
POST   /api/subjects
PUT    /api/subjects/:id
DELETE /api/subjects/:id

POST   /api/routine/generate       → calls Gemini, creates routine
GET    /api/routine/current        → fetch latest routine
PATCH  /api/routine/session/:id    → mark session complete
POST   /api/routine/regenerate     → regenerate remaining days
```

---

## 8. Gemini Prompt Design (summary)

The backend sends Gemini a structured prompt containing:
- Today's date and the target exam dates
- All subjects with their topic lists
- Daily available study hours and excluded days
- An explicit instruction to return **only valid JSON**, no prose, matching a given schema

The backend must validate the returned JSON against the expected schema before saving, and handle malformed responses with a single retry.

---

## 9. Non-Functional Requirements

- Routine generation should complete in under ~10 seconds (show loading state)
- Responsive on screens from 360px to 1920px wide
- Basic error handling and user-facing error messages (e.g., "Couldn't generate routine, please try again")
- Data validation on both frontend and backend
- Passwords hashed, JWT secrets in environment variables, no secrets committed to git

---

## 10. Build Phases

**Phase 1 — Foundation**
Repo setup, MongoDB connection, auth (register/login/JWT), protected routing

**Phase 2 — Subject Management**
Subject & topic CRUD, dashboard listing subjects with exam countdowns

**Phase 3 — Gemini Routine Generation**
Prompt design, backend Gemini service, JSON validation, routine storage, routine display UI

**Phase 4 — PDF Export**
Client-side PDF generation of the current routine

**Phase 5 — Progress Tracking & Polish**
Mark-complete functionality, progress bars, empty/loading/error states, UI polish, animations

**Phase 6 — Deployment**
Backend on Render, frontend on Vercel, environment variable configuration, final QA

---

## 11. Open Questions / Future Enhancements
- Regenerate-on-miss logic (adaptive replanning) — stretch goal for v1, core for v2
- Photo upload of a printed timetable/syllabus (Gemini vision + Cloudinary) — v2
- Weekly AI-generated performance summaries — v2
- Push/email reminders — v2