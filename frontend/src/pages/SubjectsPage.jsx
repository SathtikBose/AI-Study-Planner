import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import SubjectCard from '../components/SubjectCard';
import SubjectModal from '../components/SubjectModal';
import { Plus, BookOpen, Search, AlertCircle } from 'lucide-react';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/subjects');
      setSubjects(res.data.subjects || []);
    } catch (err) {
      setError('Failed to load subjects. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (subjectData) => {
    try {
      if (subjectData._id) {
        // Edit existing
        await axiosClient.put(`/subjects/${subjectData._id}`, subjectData);
      } else {
        // Create new
        await axiosClient.post('/subjects', subjectData);
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save subject.');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject and its topic list?')) return;
    try {
      await axiosClient.delete(`/subjects/${id}`);
      setSubjects(subjects.filter((s) => s._id !== id));
    } catch (err) {
      alert('Failed to delete subject.');
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.topics && s.topics.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Subjects</h1>
          <p className="text-sm text-slate-400 mt-1">
            Add your course subjects, set exam target dates, and list topics to cover
          </p>
        </div>

        <button onClick={handleOpenAddModal} className="gradient-button text-sm px-5 py-3">
          <Plus className="w-5 h-5" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Search subjects or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input w-full pl-10 text-sm"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Subjects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
              <div className="h-6 bg-slate-800 rounded w-1/2" />
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-2 bg-slate-800 rounded w-full" />
              <div className="h-16 bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No subjects found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            {searchQuery
              ? 'No subjects match your search query.'
              : 'Add your first subject with exam date and topic syllabus to start generating study routines.'}
          </p>
          <button onClick={handleOpenAddModal} className="gradient-button mx-auto text-sm px-5 py-2.5">
            <Plus className="w-4 h-4" />
            <span>Add First Subject</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => (
            <SubjectCard
              key={sub._id}
              subject={sub}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteSubject}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSubject}
        subjectToEdit={editingSubject}
      />

    </div>
  );
};

export default SubjectsPage;
