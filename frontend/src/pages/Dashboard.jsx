import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { exportRoutinePDF } from '../utils/pdfExporter';
import { BookOpen, Calendar, CheckCircle2, Clock, Download, Plus, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subRes, routRes] = await Promise.all([
          axiosClient.get('/subjects'),
          axiosClient.get('/routine/current'),
        ]);
        setSubjects(subRes.data.subjects || []);
        setRoutine(routRes.data.routine || null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Stats calculation
  const totalSubjects = subjects.length;
  let totalTopics = 0;
  let completedTopics = 0;

  subjects.forEach((s) => {
    if (s.topics) {
      totalTopics += s.topics.length;
      completedTopics += s.topics.filter((t) => t.completed).length;
    }
  });

  const overallTopicProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Upcoming urgent exams (sorted by nearest date)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sortedUpcomingExams = [...subjects]
    .map((s) => {
      const examDate = new Date(s.examDate);
      const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return { ...s, daysLeft, examDate };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800/80 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-600/15 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                AI-Powered Study Manager
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="gradient-text">{user?.name || 'Student'}</span>!
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              Organize your exam deadlines, list topic syllabi, and let Gemini AI generate your personalized daily study schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/subjects" className="px-4 py-3 rounded-xl border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Manage Subjects</span>
            </Link>
            <Link to="/routine" className="gradient-button text-xs px-5 py-3">
              <Calendar className="w-4 h-4" />
              <span>{routine ? 'View Active Routine' : 'Generate Routine'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* High-Level Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Subjects</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{totalSubjects}</div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Topics Covered</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {completedTopics} / {totalTopics} <span className="text-xs text-brand-400 font-normal">({overallTopicProgress}%)</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Daily Target</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {routine?.preferences?.dailyHours || 4} Hours/Day
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Planned Days</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">
              {routine?.days ? routine.days.length : 0} Days
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Upcoming Exams Ticker & Routine Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Upcoming Exam Countdowns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Upcoming Exams Countdown</h2>
              <p className="text-xs text-slate-400">Prioritized by closest exam date</p>
            </div>
            <Link to="/subjects" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse h-24" />
              ))}
            </div>
          ) : sortedUpcomingExams.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800">
              <p className="text-sm text-slate-400 mb-4">No subjects or upcoming exams added yet.</p>
              <Link to="/subjects" className="gradient-button text-xs inline-flex px-4 py-2">
                <Plus className="w-4 h-4" />
                <span>Add Your First Subject</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedUpcomingExams.slice(0, 4).map((sub) => (
                <div
                  key={sub._id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0 font-bold text-sm">
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{sub.name}</h3>
                      <p className="text-xs text-slate-400">
                        {sub.topics ? sub.topics.length : 0} Topics | Exam Date:{' '}
                        {sub.examDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                        sub.daysLeft <= 3
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                          : sub.daysLeft <= 7
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {sub.daysLeft < 0 ? 'Passed' : sub.daysLeft === 0 ? 'Today!' : `${sub.daysLeft}d left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: Routine Summary Box */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Active Routine</h2>
            <Link to="/routine" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Full Schedule <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            {routine ? (
              <>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Routine Status</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {routine.days ? routine.days.length : 0}-Day AI Study Plan
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Daily target: {routine.preferences?.dailyHours || 4} hours
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => exportRoutinePDF(routine, user ? user.name : 'Student')}
                    className="gradient-button w-full text-xs py-3"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Routine PDF</span>
                  </button>

                  <Link
                    to="/routine"
                    className="w-full py-2.5 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 text-center block transition-all"
                  >
                    Manage & Checkoff Sessions
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Active Routine</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Add your subjects and click generate to build an AI study routine.
                </p>
                <Link to="/routine" className="gradient-button text-xs px-4 py-2.5 inline-flex">
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Routine</span>
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
