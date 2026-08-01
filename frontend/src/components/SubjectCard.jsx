import React from 'react';
import { Calendar, CheckCircle2, Clock, Edit2, Trash2, List } from 'lucide-react';

const SubjectCard = ({ subject, onEdit, onDelete }) => {
  const examDateObj = new Date(subject.examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeDiff = examDateObj.getTime() - today.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

  const totalTopics = subject.topics ? subject.topics.length : 0;
  const completedTopics = subject.topics ? subject.topics.filter(t => t.completed).length : 0;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Countdown badge styling
  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (daysRemaining <= 3) {
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse';
  } else if (daysRemaining <= 7) {
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  return (
    <div className="glass-panel-hover p-6 rounded-2xl flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
              {subject.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Exam: {examDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor} flex items-center gap-1`}>
            <Clock className="w-3.5 h-3.5" />
            {daysRemaining < 0 ? 'Exam Passed' : daysRemaining === 0 ? 'Exam Today!' : `${daysRemaining} days left`}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-400">Topics Completion</span>
            <span className="text-brand-300">{completedTopics}/{totalTopics} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Topics List Preview */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <List className="w-3.5 h-3.5" />
            <span>Key Topics</span>
          </div>
          {totalTopics === 0 ? (
            <p className="text-xs text-slate-500 italic">No topics added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {subject.topics.map((t, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    t.completed
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 line-through opacity-75'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/60'
                  }`}
                >
                  {t.completed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800/60">
        <button
          onClick={() => onEdit(subject)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs flex items-center gap-1"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(subject._id)}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;
