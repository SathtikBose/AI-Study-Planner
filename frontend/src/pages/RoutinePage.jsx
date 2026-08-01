import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import RoutineCalendar from '../components/RoutineCalendar';
import LoadingState from '../components/LoadingState';
import { Sparkles, Calendar as CalendarIcon, Sliders, AlertCircle, Check, Info } from 'lucide-react';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const RoutinePage = () => {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Preference state
  const [dailyHours, setDailyHours] = useState(4);
  const [excludedDays, setExcludedDays] = useState(['Sunday']);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchRoutine = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/routine/current');
      if (res.data.routine) {
        setRoutine(res.data.routine);
        if (res.data.routine.preferences) {
          setDailyHours(res.data.routine.preferences.dailyHours || 4);
          setExcludedDays(res.data.routine.preferences.excludedDays || []);
        }
      }
    } catch (err) {
      console.error('Failed to load routine:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutine();
  }, []);

  const toggleExcludedDay = (day) => {
    if (excludedDays.includes(day)) {
      setExcludedDays(excludedDays.filter((d) => d !== day));
    } else {
      setExcludedDays([...excludedDays, day]);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setNotice('');
    try {
      setGenerating(true);
      const res = await axiosClient.post('/routine/generate', {
        dailyHours,
        excludedDays,
        startDate,
      });

      setRoutine(res.data.routine);
      if (res.data.message) {
        setNotice(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate study routine. Please ensure subjects are added.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setError('');
    setNotice('');
    try {
      setRegenerating(true);
      const res = await axiosClient.post('/routine/regenerate');
      setRoutine(res.data.routine);
      if (res.data.message) setNotice(res.data.message);
    } catch (err) {
      setError('Failed to regenerate remaining schedule.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleSession = async (sessionId, newCompletedState) => {
    try {
      const res = await axiosClient.patch(`/routine/session/${sessionId}`, {
        completed: newCompletedState,
      });
      setRoutine(res.data.routine);
    } catch (err) {
      console.error('Failed to toggle session status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Study Routine Generator</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your daily study preferences and generate an optimized day-wise schedule powered by Gemini AI
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-200 text-sm flex items-center gap-3">
          <Info className="w-5 h-5 shrink-0 text-brand-400" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Routine Preference Configurator Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Study Preferences & Generator Settings</h2>
            <p className="text-xs text-slate-400">Set daily hours, rest days, and start date</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Daily Hours Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span className="uppercase tracking-wider">Daily Study Hours</span>
              <span className="text-brand-300 font-bold text-sm">{dailyHours} Hours / Day</span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
              <span>1 hr (Light)</span>
              <span>6 hrs (Balanced)</span>
              <span>12 hrs (Intensive)</span>
            </div>
          </div>

          {/* Excluded Days Selector Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Excluded Rest Days
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => {
                const isExcluded = excludedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleExcludedDay(day)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isExcluded
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Date & Submit Button */}
          <div className="space-y-2 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Routine Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="glass-input w-full text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="gradient-button w-full py-3 text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/25 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{routine ? 'Re-generate AI Routine' : 'Generate My Routine'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* Routine Display Section */}
      {generating ? (
        <LoadingState />
      ) : loading ? (
        <div className="glass-panel p-12 rounded-3xl animate-pulse text-center">
          <div className="h-6 bg-slate-800 rounded w-1/3 mx-auto mb-4" />
          <div className="h-4 bg-slate-800 rounded w-1/4 mx-auto" />
        </div>
      ) : (
        <RoutineCalendar
          routine={routine}
          onToggleSession={handleToggleSession}
          onRegenerate={handleRegenerate}
          isRegenerating={regenerating}
        />
      )}

    </div>
  );
};

export default RoutinePage;
