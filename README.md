# 🎓 AI Study Planner

A full-stack, production-ready web application designed for students preparing for exams. Users enter their course subjects, target exam dates, and topic syllabi, and an AI (Google Gemini 2.5/1.5 Flash) generates a personalized day-by-day study routine that can be downloaded as a PDF document.

![AI Study Planner](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MongoDB%20%7C%20Gemini%20AI-6366f1)
![License](https://img.shields.io/badge/License-MIT-emerald)

---

## ✨ Features

- 🔐 **Authentication**: User Registration, JWT-based login, password hashing with bcrypt, and session persistence.
- 📚 **Subject & Topic Management**:
  - Add, edit, and delete subjects.
  - Interactive topic tag manager with difficulty ratings (*Easy*, *Medium*, *Hard*).
  - Exam date picker with automatic future-date validation.
  - Live countdown ticker highlighting upcoming exams.
- 🤖 **Gemini AI Routine Generation**:
  - Custom study preferences: daily study hours (1–12 hrs), excluded rest days (e.g., Sundays), and start date.
  - Generates balanced day-by-day study sessions prioritized by upcoming exam dates.
  - Intelligent local fallback scheduler if no API key is present.
- 📅 **Interactive Routine View**:
  - Mark individual study sessions complete with real-time topic progress updates.
  - Filter by *All Days*, *Today*, or *Pending Work*.
  - Regenerate remaining days if falling behind schedule.
- 📄 **PDF Export**:
  - Export the current study routine into a clean, printable PDF document using `jsPDF` and `jspdf-autotable`.
- 🎨 **Modern Aesthetics**:
  - Sleek glassmorphism dark theme with vibrant indigo/violet accent palette, micro-animations, and responsive layouts across mobile, tablet, and desktop.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas / Mongoose (with automated `mongodb-memory-server` fallback for local dev) |
| **AI Engine** | Google Gemini API (`@google/generative-ai`) |
| **PDF Export** | Client-side `jsPDF` & `jspdf-autotable` |
| **Authentication** | JWT (JSON Web Tokens) & `bcryptjs` |
| **Deployment** | Frontend on **Vercel**, Backend on **Render** |

---

## 📁 Repository Structure

```
AI Study Planner/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection & memory fallback
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT protected routes middleware
│   │   │   └── errorHandler.js       # Central error handler
│   │   ├── models/
│   │   │   ├── User.js               # User schema with bcrypt
│   │   │   ├── Subject.js            # Subject & topics schema
│   │   │   └── Routine.js            # Routine & daily sessions schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Auth API endpoints
│   │   │   ├── subjectRoutes.js      # Subject CRUD API endpoints
│   │   │   └── routineRoutes.js      # Routine generation API endpoints
│   │   ├── services/
│   │   │   └── geminiService.js      # Gemini AI integration service
│   │   └── server.js                 # Express server entry point
│   ├── .env.example
│   ├── render.yaml                   # Render Blueprint config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js        # Axios instance with auth interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── SubjectCard.jsx
│   │   │   ├── SubjectModal.jsx
│   │   │   ├── RoutineCalendar.jsx
│   │   │   └── LoadingState.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global Auth State Provider
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SubjectsPage.jsx
│   │   │   └── RoutinePage.jsx
│   │   ├── utils/
│   │   │   └── pdfExporter.js        # PDF generation utility
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── vercel.json                   # Vercel SPA routing rewrite rules
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/ai-study-planner.git
cd "AI Study Planner"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables Setup

#### Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-study-planner
JWT_SECRET=your_super_secret_jwt_key_here
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
```
> *Note: If `MONGODB_URI` is left empty, the server automatically starts an in-memory MongoDB server for testing.*

#### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Run Locally

Start the backend API server:
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

In a second terminal, start the Vite frontend server:
```bash
cd frontend
npm run dev
# Web app will open at http://localhost:3000
```

---

## ☁️ Deployment Instructions

### Deploying Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the Web Service:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Add **Environment Variables** under Settings:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A secure random string*
   - `GEMINI_API_KEY`: *Your Google AI Studio API Key*
5. Click **Create Web Service**. Save your deployed URL (e.g. `https://ai-study-planner-backend.onrender.com`).

---

### Deploying Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit and set to `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variables**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://ai-study-planner-backend.onrender.com/api` (replace with your actual Render backend URL)
5. Click **Deploy**. Vercel will automatically build and host your app with clean SPA routing enabled via `vercel.json`.

---

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new student account
- `POST /api/auth/login` — Authenticate and return JWT token
- `GET /api/auth/me` — Fetch currently logged-in user profile

### Subjects & Topics
- `GET /api/subjects` — Get user's subjects list
- `POST /api/subjects` — Create new subject with topics & exam date
- `PUT /api/subjects/:id` — Update existing subject
- `DELETE /api/subjects/:id` — Delete subject and topics

### AI Study Routine
- `POST /api/routine/generate` — Call Gemini API to generate day-by-day routine
- `GET /api/routine/current` — Fetch active routine for user
- `PATCH /api/routine/session/:id` — Toggle completion status of a study session
- `POST /api/routine/regenerate` — Regenerate remaining uncompleted study schedule

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
