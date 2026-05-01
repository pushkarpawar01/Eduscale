import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axiosInstance';
import VideoPlayer from '../components/VideoPlayer';
import Sidebar from '../components/Sidebar';
import { PlayCircle, FileText, CheckCircle, ChevronRight, BookOpen, HelpCircle } from 'lucide-react';

const CourseView = () => {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({ progress: 0, completedModules: [] });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          api.get(`/api/course/${courseId}`),
          api.get(`/api/enrollment/progress/${courseId}`)
        ]);
        setData(courseRes.data);
        setProgressData(progressRes.data);
      } catch (error) {
        console.error('Failed to fetch course details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleModuleComplete = async (moduleId) => {
    try {
      const res = await api.post(`/api/enrollment/progress/${courseId}`, { moduleId });
      setProgressData({
        progress: res.data.progress,
        completedModules: res.data.completedModules
      });
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!data) return <div className="p-8 text-center">Course not found.</div>;

  const activeModule = data.course.modules[activeModuleIndex];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Course Header */}
        <header className="bg-white border-b border-dark-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4 overflow-hidden">
            <Link to="/enrolled" className="text-dark-500 hover:text-primary transition-colors">
              <ChevronRight className="rotate-180" />
            </Link>
            <h1 className="font-bold text-lg truncate text-dark-900">{data.course.title}</h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-2 bg-dark-100 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: `${progressData.progress}%` }} />
              </div>
              <span className="text-xs font-bold text-dark-600">{progressData.progress}%</span>
            </div>
            {data.quiz && progressData.progress >= 80 && (
              <button className="px-4 py-2 bg-accent text-white rounded-lg font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2">
                <HelpCircle size={16} /> Take Quiz
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-dark-900">
            <div className="max-w-5xl mx-auto">
              {activeModule?.videoUrl ? (
                <div className="mb-8">
                  <VideoPlayer 
                    src={activeModule.videoUrl} 
                    onEnded={() => handleModuleComplete(activeModule._id || activeModule.title)} 
                  />
                </div>
              ) : (
                <div className="bg-dark-800 rounded-2xl p-12 text-center text-white mb-8 border border-dark-700">
                  <PlayCircle size={64} className="mx-auto mb-4 text-dark-500" />
                  <p>No video for this module</p>
                </div>
              )}

              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-dark-900 mb-4">{activeModule?.title}</h2>
                <p className="text-dark-600 leading-relaxed mb-8">{data.course.description}</p>
                
                {activeModule?.pdfUrl && (
                  <div className="mt-8 border-t border-dark-100 pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-dark-900 flex items-center gap-2">
                        <FileText className="text-primary" /> Study Notes
                      </h3>
                      <button 
                        onClick={() => window.open(activeModule.pdfUrl, '_blank')}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Open in New Tab
                      </button>
                    </div>
                    <div className="aspect-[1/1.4] w-full bg-dark-50 rounded-xl border-2 border-dark-200 overflow-hidden relative shadow-inner">
                      <iframe 
                        src={`${activeModule.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                        className="w-full h-full" 
                        title="Course Notes"
                        style={{ border: 'none' }}
                      />
                      <div className="absolute top-0 right-0 p-2 bg-white/80 backdrop-blur-sm rounded-bl-lg text-[10px] font-bold text-dark-500 uppercase tracking-tight pointer-events-none">
                        View Only Mode
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Module List Sidebar */}
          <div className="w-full lg:w-80 bg-white border-l border-dark-200 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-dark-200 bg-dark-50">
              <h3 className="font-bold text-dark-900 flex items-center gap-2">
                <BookOpen size={20} className="text-primary" /> Course Modules
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {data.course.modules.map((module, index) => {
                const isCompleted = progressData.completedModules.includes(module._id || module.title);
                const isActive = activeModuleIndex === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => setActiveModuleIndex(index)}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl transition-all ${
                      isActive ? 'bg-primary/5 border border-primary/20' : 'hover:bg-dark-50'
                    }`}
                  >
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle size={18} className="text-success" />
                      ) : (
                        <PlayCircle size={18} className={isActive ? 'text-primary' : 'text-dark-400'} />
                      )}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-dark-900'}`}>
                        {module.title}
                      </p>
                      <span className="text-xs text-dark-400">{module.duration || 'Video'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseView;
