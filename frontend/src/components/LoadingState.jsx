import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Calendar, CheckCircle2 } from 'lucide-react';

const steps = [
  'Analyzing subjects & exam deadlines...',
  'Evaluating topics difficulty & available hours...',
  'Consulting Gemini AI model for optimal study sequence...',
  'Structuring day-by-day study sessions & breaks...',
  'Finalizing personalized study routine PDF layout...',
];

const LoadingState = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-3xl border border-brand-500/30 text-center relative overflow-hidden animate-fadeIn">
      
      {/* Animated Background Glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />

      {/* Center Icon Spinner */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-brand-500/30 animate-bounce">
          <Sparkles className="w-10 h-10 text-white animate-spin" />
        </div>
        <div className="absolute -inset-2 rounded-3xl border-2 border-dashed border-brand-400/40 animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      {/* Header */}
      <h3 className="text-2xl font-extrabold text-white mb-2">
        Generating Your AI Study Routine
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-8">
        Please wait a moment while Gemini AI crafts a realistic, balanced study plan tailored to your exam target dates.
      </p>

      {/* Steps List */}
      <div className="w-full max-w-md space-y-3 text-left">
        {steps.map((stepText, index) => {
          const isDone = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${
                isCurrent
                  ? 'bg-brand-600/20 border-brand-500/40 text-brand-200'
                  : isDone
                  ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                  : 'bg-slate-900/20 border-slate-800/40 text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Brain className="w-5 h-5 text-brand-400 shrink-0 animate-pulse" />
              ) : (
                <div className="w-5 h-5 rounded-full border border-slate-700 shrink-0" />
              )}
              <span className="text-xs font-medium">{stepText}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default LoadingState;
