import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, BookOpen, AlertCircle, Trash2 } from 'lucide-react';

const SubjectModal = ({ isOpen, onClose, onSave, subjectToEdit }) => {
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name || '');
      setExamDate(subjectToEdit.examDate ? subjectToEdit.examDate.split('T')[0] : '');
      setTopics(subjectToEdit.topics || []);
    } else {
      setName('');
      // Default to 14 days from today
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setExamDate(defaultDate.toISOString().split('T')[0]);
      setTopics([]);
    }
    setError('');
  }, [subjectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    if (topics.some((t) => t.name.toLowerCase() === topicInput.trim().toLowerCase())) {
      setError('Topic already added to this subject');
      return;
    }
    setTopics([...topics, { name: topicInput.trim(), difficulty, completed: false }]);
    setTopicInput('');
    setError('');
  };

  const handleRemoveTopic = (index) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Subject name is required');
      return;
    }

    if (!examDate) {
      setError('Exam date is required');
      return;
    }

    const selectedDate = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('Exam date must be today or in the future');
      return;
    }

    if (topics.length === 0) {
      setError('Please add at least one topic for this subject');
      return;
    }

    onSave({
      _id: subjectToEdit ? subjectToEdit._id : undefined,
      name: name.trim(),
      examDate,
      topics,
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <p className="text-xs text-slate-400">
              Enter subject details, exam date, and topic syllabus
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Subject Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Subject Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Organic Chemistry, Linear Algebra, Modern Physics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input w-full"
              required
            />
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Exam Date * (Must be future)
            </label>
            <div className="relative">
              <input
                type="date"
                min={todayStr}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="glass-input w-full"
                required
              />
            </div>
          </div>

          {/* Topics Manager */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Add Topics / Syllabus Items *
            </label>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Topic title e.g. Differential Equations"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopic(e);
                  }
                }}
                className="glass-input flex-1 text-sm"
              />
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="glass-input text-xs w-28"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <button
                type="button"
                onClick={handleAddTopic}
                className="gradient-button text-xs px-3 py-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Added Topics List */}
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {topics.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  No topics added yet. Type a topic name above and click Add.
                </div>
              ) : (
                topics.map((t, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">{t.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.difficulty === 'Hard'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : t.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {t.difficulty}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(index)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button type="submit" className="gradient-button text-sm px-5 py-2">
              {subjectToEdit ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default SubjectModal;
