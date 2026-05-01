import React, { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import Sidebar from '../components/Sidebar';
import { 
  Plus, Edit, Trash2, Video, FileText, CheckCircle, AlertCircle, Save, X, Search, 
  MoreVertical, Users, BookOpen, Layout, ChevronDown, ChevronUp, PlusCircle, MinusCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' or 'enrollments'
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  // Form State
  const [courseData, setCourseData] = useState({
    title: '', description: '', imageUrl: '', price: 0, isFree: false, category: ''
  });
  const [modules, setModules] = useState([{ 
    title: '', description: '', videoUrl: '', pdfUrl: '', duration: '', 
    quiz: [] 
  }]);
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, enrollRes] = await Promise.all([
        api.get('/api/course'),
        api.get('/api/enrollment/all')
      ]);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
      setEnrollments(Array.isArray(enrollRes.data) ? enrollRes.data : []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setCourseData({ title: '', description: '', imageUrl: '', price: 0, isFree: false, category: '' });
    setModules([{ title: '', description: '', videoUrl: '', pdfUrl: '', duration: '', quiz: [] }]);
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
    // Ensure all existing modules have a quiz array
    const existingModules = course.modules.map(m => ({
      ...m,
      quiz: m.quiz || []
    }));
    setModules(existingModules.length > 0 ? existingModules : [{ title: '', description: '', videoUrl: '', pdfUrl: '', duration: '', quiz: [] }]);
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
    setModules([...modules, { title: '', description: '', videoUrl: '', pdfUrl: '', duration: '', quiz: [] }]);
  };

  const removeModuleField = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const addQuizQuestion = (moduleIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].quiz.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setModules(newModules);
  };

  const removeQuizQuestion = (moduleIndex, questionIndex) => {
    const newModules = [...modules];
    newModules[moduleIndex].quiz = newModules[moduleIndex].quiz.filter((_, i) => i !== questionIndex);
    setModules(newModules);
  };

  const handleQuizChange = (moduleIndex, questionIndex, field, value, optionIndex = null) => {
    const newModules = [...modules];
    if (optionIndex !== null) {
      newModules[moduleIndex].quiz[questionIndex].options[optionIndex] = value;
    } else {
      newModules[moduleIndex].quiz[questionIndex][field] = value;
    }
    setModules(newModules);
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
      alert('File upload failed.');
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
      fetchData();
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
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-dark-900">Admin Control Center</h1>
              <p className="text-dark-500 mt-1">Manage content and monitor student excellence</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-dark-200">
              <button 
                onClick={() => setActiveTab('courses')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'courses' ? 'bg-primary text-white shadow-md' : 'text-dark-500 hover:bg-dark-50'}`}
              >
                Courses
              </button>
              <button 
                onClick={() => setActiveTab('enrollments')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'enrollments' ? 'bg-primary text-white shadow-md' : 'text-dark-500 hover:bg-dark-50'}`}
              >
                Student Progress
              </button>
            </div>
          </div>
          
          {activeTab === 'courses' && (
            <button 
              onClick={handleOpenCreate}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <Plus size={20} /> Create New Course
            </button>
          )}
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

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {activeTab === 'courses' ? (
              <div className="bg-white rounded-2xl border border-dark-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-dark-50 border-b border-dark-200">
                        <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Course Info</th>
                        <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Curriculum</th>
                        <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-100">
                      {courses.map((course) => (
                        <tr key={course._id} className="hover:bg-dark-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={course.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-dark-100" />
                              <div className="min-w-0">
                                <p className="font-bold text-dark-900 truncate">{course.title}</p>
                                <p className="text-xs text-primary font-bold uppercase">{course.category || 'General'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-dark-900">
                              {course.isFree ? <span className="text-success">Free</span> : `₹${course.price}`}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-dark-700 flex items-center gap-1">
                                <BookOpen size={14} /> {course.modules?.length || 0} Modules
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleOpenEdit(course)} className="p-2 text-dark-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"><Edit size={18} /></button>
                              <button onClick={() => handleDelete(course._id)} className="p-2 text-dark-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dark-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-dark-50 border-b border-dark-200">
                        <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Course</th>
                        <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-4 text-xs font-bold text-dark-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-100">
                      {enrollments.map((enr) => (
                        <tr key={enr._id}>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <p className="font-bold text-dark-900">{enr.user?.name}</p>
                              <p className="text-xs text-dark-500">{enr.user?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-dark-700">{enr.course?.title}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-dark-100 rounded-full overflow-hidden">
                                <div className="bg-primary h-full" style={{ width: `${enr.progress}%` }} />
                              </div>
                              <span className="text-xs font-bold text-dark-600">{enr.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${enr.completed ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'}`}>
                              {enr.completed ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal Builder */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm" onClick={() => !saving && setIsModalOpen(false)} />
            <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              <header className="p-6 border-b border-dark-200 flex items-center justify-between bg-dark-50">
                <h2 className="text-xl font-bold text-dark-900">{editingCourse ? 'Update Curriculum' : 'New Course Design'}</h2>
                <button onClick={() => setIsModalOpen(false)} disabled={saving} className="p-2 hover:bg-dark-200 rounded-full"><X size={20} /></button>
              </header>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-10">
                <section className="space-y-6">
                  <h3 className="text-sm font-bold text-dark-400 uppercase tracking-widest border-b border-dark-100 pb-2">1. Course Essentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-dark-700 mb-2">Title</label>
                      <input id="title" type="text" required value={courseData.title} onChange={handleCourseChange} className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-dark-700 mb-2">General Description</label>
                      <textarea id="description" required rows="3" value={courseData.description} onChange={handleCourseChange} className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-dark-50 rounded-xl border border-dark-200 md:col-span-2">
                      <input id="isFree" type="checkbox" checked={courseData.isFree} onChange={handleCourseChange} className="w-5 h-5 rounded border-dark-300 text-primary" />
                      <label htmlFor="isFree" className="text-sm font-bold text-dark-900">This is a free course</label>
                      {!courseData.isFree && (
                        <div className="ml-auto flex items-center gap-2">
                          <span className="font-bold">Price: ₹</span>
                          <input id="price" type="number" value={courseData.price} onChange={handleCourseChange} className="w-24 px-3 py-1 border rounded-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-dark-100 pb-2">
                    <h3 className="text-sm font-bold text-dark-400 uppercase tracking-widest">2. Curriculum Modules</h3>
                    <button type="button" onClick={addModuleField} className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-all">
                      <PlusCircle size={14} /> Add New Module
                    </button>
                  </div>

                  <div className="space-y-8">
                    {modules.map((module, mIdx) => (
                      <div key={mIdx} className="bg-dark-50/50 p-6 rounded-3xl border-2 border-dark-100 relative">
                        <button type="button" onClick={() => removeModuleField(mIdx)} className="absolute top-4 right-4 text-danger hover:bg-danger/10 p-2 rounded-full"><Trash2 size={18} /></button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Module Header</label>
                            <input type="text" value={module.title} onChange={(e) => handleModuleChange(mIdx, 'title', e.target.value)} className="w-full px-0 py-1 bg-transparent border-b border-dark-200 focus:border-primary outline-none font-bold text-lg" placeholder="Module Title" />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-dark-400 uppercase mb-1">Module Description / Tasks</label>
                            <textarea value={module.description} onChange={(e) => handleModuleChange(mIdx, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-dark-200 rounded-xl text-sm" rows="2" placeholder="Briefly explain what tasks students should perform..." />
                          </div>

                          <div className="flex flex-col gap-4">
                            <label className="text-[10px] font-bold text-dark-400 uppercase">Video Content (URL or Upload)</label>
                            <div className="flex gap-2">
                              <input type="text" value={module.videoUrl} onChange={(e) => handleModuleChange(mIdx, 'videoUrl', e.target.value)} className="flex-1 px-3 py-2 bg-white border border-dark-200 rounded-lg text-sm" placeholder="S3 URL" />
                              <label className="p-2 bg-dark-900 text-white rounded-lg cursor-pointer"><Video size={18} /><input type="file" className="hidden" onChange={(e) => handleFileUpload(mIdx, 'videoUrl', e.target.files[0])} /></label>
                            </div>
                          </div>

                          <div className="flex flex-col gap-4">
                            <label className="text-[10px] font-bold text-dark-400 uppercase">Study Notes (PDF or Upload)</label>
                            <div className="flex gap-2">
                              <input type="text" value={module.pdfUrl} onChange={(e) => handleModuleChange(mIdx, 'pdfUrl', e.target.value)} className="flex-1 px-3 py-2 bg-white border border-dark-200 rounded-lg text-sm" placeholder="S3 URL" />
                              <label className="p-2 bg-primary text-white rounded-lg cursor-pointer"><FileText size={18} /><input type="file" className="hidden" onChange={(e) => handleFileUpload(mIdx, 'pdfUrl', e.target.files[0])} /></label>
                            </div>
                          </div>

                          <div className="md:col-span-2 mt-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xs font-bold text-dark-600 uppercase flex items-center gap-2">
                                <Layout size={14} /> Module Quiz (MCQs)
                              </h4>
                              <button type="button" onClick={() => addQuizQuestion(mIdx)} className="text-[10px] font-bold text-accent border border-accent/20 px-2 py-1 rounded-md hover:bg-accent/5">
                                + Add Question
                              </button>
                            </div>
                            
                            <div className="space-y-4">
                              {module.quiz?.map((q, qIdx) => (
                                <div key={qIdx} className="bg-white p-4 rounded-xl border border-dark-200 relative">
                                  <button type="button" onClick={() => removeQuizQuestion(mIdx, qIdx)} className="absolute top-2 right-2 text-danger"><MinusCircle size={16} /></button>
                                  <input 
                                    type="text" value={q.question} 
                                    onChange={(e) => handleQuizChange(mIdx, qIdx, 'question', e.target.value)}
                                    className="w-full mb-3 font-medium border-b border-dark-100 outline-none text-sm" 
                                    placeholder="Question Text" 
                                  />
                                  <div className="grid grid-cols-2 gap-2">
                                    {q.options.map((opt, oIdx) => (
                                      <div key={oIdx} className="flex items-center gap-2">
                                        <input 
                                          type="radio" name={`correct-${mIdx}-${qIdx}`} 
                                          checked={q.correctAnswer === oIdx}
                                          onChange={() => handleQuizChange(mIdx, qIdx, 'correctAnswer', oIdx)}
                                        />
                                        <input 
                                          type="text" value={opt} 
                                          onChange={(e) => handleQuizChange(mIdx, qIdx, 'options', e.target.value, oIdx)}
                                          className="text-xs border-b border-dark-50 outline-none flex-1" 
                                          placeholder={`Option ${oIdx + 1}`} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </form>

              <footer className="p-6 border-t border-dark-200 bg-dark-50 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-dark-600 font-bold hover:bg-dark-200 rounded-xl transition-all">Cancel</button>
                <button onClick={handleSubmit} disabled={saving || uploading} className="px-8 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                  {editingCourse ? 'Commit Changes' : 'Launch Course'}
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
