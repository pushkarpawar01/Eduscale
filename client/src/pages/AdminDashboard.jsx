import React, { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import Sidebar from '../components/Sidebar';
import { Plus, Edit, Trash2, Video, FileText, CheckCircle, AlertCircle, Save, X, Search, MoreVertical } from 'lucide-react';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // Form State
  const [courseData, setCourseData] = useState({
    title: '', description: '', imageUrl: '', price: 0, isFree: false, category: ''
  });
  const [modules, setModules] = useState([{ title: '', videoUrl: '', pdfUrl: '', duration: '' }]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/course'); // Assuming this returns all courses
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setCourseData({ title: '', description: '', imageUrl: '', price: 0, isFree: false, category: '' });
    setModules([{ title: '', videoUrl: '', pdfUrl: '', duration: '' }]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setCourseData({
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      price: course.price,
      isFree: course.isFree,
      category: course.category
    });
    setModules(course.modules && course.modules.length > 0 ? course.modules : [{ title: '', videoUrl: '', pdfUrl: '', duration: '' }]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/api/course/${id}`);
      setCourses(courses.filter(c => c._id !== id));
      setStatus({ type: 'success', msg: 'Course deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', msg: 'Failed to delete course' });
    }
  };

  const handleCourseChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setCourseData({ ...courseData, [e.target.id]: value });
  };

  const handleModuleChange = (index, field, value) => {
    const newModules = [...modules];
    newModules[index][field] = value;
    setModules(newModules);
  };

  const addModuleField = () => {
    setModules([...modules, { title: '', videoUrl: '', pdfUrl: '', duration: '' }]);
  };

  const removeModuleField = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (index, field, file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/course/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleModuleChange(index, field, res.data.url);
    } catch (error) {
      alert('File upload failed. Check server/S3 config.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...courseData, modules };
      
      if (editingCourse) {
        await api.put(`/api/course/${editingCourse._id}`, payload);
        setStatus({ type: 'success', msg: 'Course updated successfully!' });
      } else {
        await api.post('/api/course/create', payload);
        setStatus({ type: 'success', msg: 'Course created successfully!' });
      }
      
      setIsModalOpen(false);
      fetchCourses();
    } catch (error) {
      setStatus({ type: 'error', msg: 'Failed to save course.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-900">Course Management</h1>
            <p className="text-dark-500 mt-1">Create, edit and manage your educational content</p>
          </div>
          <button 
            onClick={handleOpenCreate}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={20} /> Create New Course
          </button>
        </header>

        {status.msg && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            status.type === 'error' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'
          }`}>
            <div className="flex items-center gap-3">
              {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
              <span className="font-bold">{status.msg}</span>
            </div>
            <button onClick={() => setStatus({ type: '', msg: '' })}><X size={18} /></button>
          </div>
        )}

        {/* Course List Table */}
        <div className="bg-white rounded-2xl border border-dark-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-50 border-b border-dark-200">
                  <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Modules</th>
                  <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {courses.length > 0 ? courses.map((course) => (
                  <tr key={course._id} className="hover:bg-dark-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={course.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover bg-dark-100 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-dark-900 truncate">{course.title}</p>
                          <p className="text-xs text-dark-500 truncate max-w-[200px]">{course.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {course.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-dark-900">
                        {course.isFree ? 'Free' : `₹${course.price}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-dark-500">
                        <Video size={16} />
                        <span className="text-sm font-medium">{course.modules?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(course)}
                          className="p-2 text-dark-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Edit Course"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(course._id)}
                          className="p-2 text-dark-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                          title="Delete Course"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-dark-400">
                      {loading ? 'Loading courses...' : 'No courses found. Create your first one!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm" onClick={() => !saving && setIsModalOpen(false)} />
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <header className="p-6 border-b border-dark-200 flex items-center justify-between bg-dark-50">
                <h2 className="text-xl font-bold text-dark-900">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  disabled={saving}
                  className="p-2 hover:bg-dark-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </header>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                {/* Course Details */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="title" className="block text-sm font-bold text-dark-700 mb-2">Course Title</label>
                      <input 
                        id="title" type="text" required value={courseData.title} onChange={handleCourseChange}
                        className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-bold text-dark-700 mb-2">Description</label>
                      <textarea 
                        id="description" required rows="3" value={courseData.description} onChange={handleCourseChange}
                        className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="imageUrl" className="block text-sm font-bold text-dark-700 mb-2">Thumbnail URL</label>
                      <input 
                        id="imageUrl" type="text" required value={courseData.imageUrl} onChange={handleCourseChange}
                        className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-bold text-dark-700 mb-2">Category</label>
                      <input 
                        id="category" type="text" value={courseData.category} onChange={handleCourseChange}
                        className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-8 p-4 bg-dark-50 rounded-xl border border-dark-200 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <input 
                          id="isFree" type="checkbox" checked={courseData.isFree} onChange={handleCourseChange}
                          className="w-5 h-5 rounded border-dark-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="isFree" className="text-sm font-bold text-dark-900">Free Course</label>
                      </div>
                      {!courseData.isFree && (
                        <div className="flex-1 max-w-[200px]">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 font-bold">₹</span>
                            <input 
                              id="price" type="number" value={courseData.price} onChange={handleCourseChange}
                              className="w-full pl-8 pr-4 py-2 bg-white border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modules Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-dark-400 uppercase tracking-wider">Curriculum Modules</h3>
                    <button 
                      type="button" onClick={addModuleField}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} /> Add Module
                    </button>
                  </div>

                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div key={index} className="p-4 bg-dark-50 rounded-2xl border border-dark-200 relative group">
                        <button 
                          type="button" onClick={() => removeModuleField(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X size={14} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <input 
                              type="text" value={module.title} onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 border-b-2 border-dark-200 bg-transparent focus:border-primary outline-none transition-all font-bold"
                              placeholder="Module Title (e.g. Introduction)"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-dark-400 uppercase">Video URL / Upload</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" value={module.videoUrl} onChange={(e) => handleModuleChange(index, 'videoUrl', e.target.value)}
                                className="flex-1 px-3 py-2 bg-white border border-dark-200 rounded-lg text-sm"
                                placeholder="S3 URL or Upload"
                              />
                              <label className="shrink-0 p-2 bg-dark-900 text-white rounded-lg cursor-pointer hover:bg-dark-800 transition-all">
                                <Video size={18} />
                                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(index, 'videoUrl', e.target.files[0])} />
                              </label>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-dark-400 uppercase">PDF URL / Upload</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" value={module.pdfUrl} onChange={(e) => handleModuleChange(index, 'pdfUrl', e.target.value)}
                                className="flex-1 px-3 py-2 bg-white border border-dark-200 rounded-lg text-sm"
                                placeholder="S3 URL or Upload"
                              />
                              <label className="shrink-0 p-2 bg-dark-900 text-white rounded-lg cursor-pointer hover:bg-dark-800 transition-all">
                                <FileText size={18} />
                                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(index, 'pdfUrl', e.target.files[0])} />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>

              <footer className="p-6 border-t border-dark-200 bg-dark-50 flex justify-end gap-4">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-dark-600 font-bold hover:bg-dark-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit} disabled={saving || uploading}
                  className="px-8 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-70"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                  {editingCourse ? 'Save Changes' : 'Publish Course'}
                </button>
              </footer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
