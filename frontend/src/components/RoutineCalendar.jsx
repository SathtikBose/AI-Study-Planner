import React, { useState } from 'react';
import { Download, RefreshCw, CheckSquare, Square, Clock, BookOpen, Calendar, Filter, Sparkles } from 'lucide-react';
import { exportRoutinePDF } from '../utils/pdfExporter';
import { useAuth } from '../context/AuthContext';

const RoutineCalendar = ({ routine, onToggleSession, onRegenerate, isRegenerating }) => {
  const { user } = useAuth();
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'today', 'pending'

  if (!routine || !routine.days || routine.days.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
        <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Routine Generated Yet</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Add your subjects and click "Generate Study Routine" to build your personalized AI plan.
        </p>
      </div>
    );
  }

  // Calculate overall statistics
  let totalSessions = 0;
  let completedSessions = 0;
  let totalMinutes = 0;

  routine.days.forEach((day) => {
    day.sessions.forEach((s) => {
      totalSessions++;
      totalMinutes += s.durationMinutes || 60;
      if (s.completed) completedSessions++;
    });
  });

  const completionPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Filter Days
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredDays = routine.days.filter((dayObj) => {
    const dayDateStr = new Date(dayObj.date).toISOString().split('T')[0];
    if (filterMode === 'today') {
      return dayDateStr === todayStr;
    }
    if (filterMode === 'pending') {
      return dayObj.sessions.some((s) => !s.completed);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner Stats & Actions */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Active AI Routine
            </span>
            <span className="text-xs text-slate-400">
              Generated {new Date(routine.generatedAt || routine.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">Your Day-by-Day Study Plan</h2>
          <p className="text-xs text-slate-400 mt-1">
            {totalSessions} total sessions across {routine.days.length} days (~{totalHours} total study hours)
          </p>
        </div>

        {/* Progress Bar & Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          
          {/* Progress Widget */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-4 min-w-[180px]">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="18" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  stroke="#6366f1"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="113"
                  strokeDashoffset={113 - (113 * completionPercent) / 100}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white">{completionPercent}%</span>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Completed</div>
              <div className="text-sm font-bold text-white">
                {completedSessions} / {totalSessions}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportRoutinePDF(routine, user ? user.name : 'Student')}
              className="gradient-button text-xs px-4 py-3"
              title="Download routine as PDF document"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="px-4 py-3 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
              title="Regenerate remaining days"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>

        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterMode === 'all' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Days ({routine.days.length})
          </button>
          <button
            onClick={() => setFilterMode('today')}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterMode === 'today' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterMode === 'pending' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Work
          </button>
        </div>
      </div>

      {/* Days Grid */}
      {filteredDays.length === 0 ? (
        <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-sm">
          No study days match the selected filter option.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDays.map((dayObj, dayIdx) => {
            const dayDate = new Date(dayObj.date);
            const isToday = dayDate.toISOString().split('T')[0] === todayStr;

            const dayCompletedSessions = dayObj.sessions.filter((s) => s.completed).length;
            const dayTotalSessions = dayObj.sessions.length;

            return (
              <div
                key={dayObj._id || dayIdx}
                className={`glass-panel p-6 rounded-2xl border transition-all ${
                  isToday
                    ? 'border-brand-500/80 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/30'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">
                        {dayDate.toLocaleDateString(undefined, { weekday: 'long' })}
                      </h3>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500 text-white uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-brand-300">
                      {dayCompletedSessions}/{dayTotalSessions} Done
                    </span>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="space-y-3">
                  {dayObj.sessions.map((sess) => (
                    <div
                      key={sess._id}
                      onClick={() => onToggleSession(sess._id, !sess.completed)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 group ${
                        sess.completed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-brand-500/40 text-slate-200'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {sess.completed ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-500 group-hover:text-brand-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span
                            className={`text-xs font-semibold uppercase tracking-wider ${
                              sess.completed ? 'text-slate-500 line-through' : 'text-brand-400'
                            }`}
                          >
                            {sess.subjectName}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {sess.durationMinutes}m
                          </span>
                        </div>
                        <p
                          className={`text-sm font-medium leading-snug ${
                            sess.completed ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {sess.topic}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default RoutineCalendar;
