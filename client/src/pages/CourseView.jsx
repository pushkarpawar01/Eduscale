import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axiosInstance';
import VideoPlayer from '../components/VideoPlayer';
import Sidebar from '../components/Sidebar';
import {
  PlayCircle, FileText, CheckCircle, ChevronRight, BookOpen,
  HelpCircle, ExternalLink, ShieldCheck, DownloadCloud, AlertTriangle, Lock, Award, RotateCcw
} from 'lucide-react';

const CourseView = () => {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({ progress: 0, completedModules: [], quizResults: [] });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleModuleComplete = useCallback(async (moduleId) => {
    try {
      const res = await api.post(`/api/enrollment/progress/${courseId}`, { moduleId });
      setProgressData(prev => ({
        ...prev,
        progress: res.data.progress,
        completedModules: res.data.completedModules
      }));
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  }, [courseId]);

  const handleQuizSubmit = async () => {
    const activeModule = data.course.modules[activeModuleIndex];
    const moduleId = activeModule._id || activeModule.title;
    let score = 0;

    activeModule.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });

    try {
      const res = await api.post(`/api/enrollment/quiz/${courseId}`, {
        moduleId,
        score,
        totalQuestions: activeModule.quiz.length
      });
      setProgressData(prev => ({
        ...prev,
        quizResults: res.data.quizResults
      }));
    } catch (error) {
      alert('Failed to save quiz results');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!data) return <div className="p-8 text-center text-slate-900 bg-slate-50 h-screen font-black text-xl flex items-center justify-center">Course not found.</div>;

  const activeModule = data.course.modules[activeModuleIndex];
  const isModuleCompleted = progressData.completedModules.includes(activeModule?._id || activeModule?.title);
  const existingResult = progressData.quizResults?.find(r => r.moduleId === (activeModule?._id || activeModule?.title));

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/30">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Course Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between z-20 shadow-sm">
          <div className="flex items-center gap-6 overflow-hidden">
            <Link to="/enrolled" className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all border border-slate-200 shadow-sm">
              <ChevronRight className="rotate-180" size={20} />
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold text-xl truncate text-slate-900">{data.course.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Module {activeModuleIndex + 1}: {activeModule?.title}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 shrink-0">
            <div className="hidden sm:flex flex-col items-end gap-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Progress</span>
              <div className="flex items-center gap-3">
                <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                  <div className="bg-primary h-full transition-all duration-700 ease-out" style={{ width: `${progressData.progress}%` }} />
                </div>
                <span className="text-xs font-bold text-primary">{progressData.progress}%</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50 no-scrollbar pb-32">
            <div className="max-w-6xl mx-auto p-4 sm:p-10 space-y-10">

              {/* Video Component Section */}
              <section className="relative">
                {activeModule?.videoUrl ? (
                  <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-black aspect-video relative z-10">
                    <VideoPlayer
                      src={activeModule.videoUrl}
                      onEnded={() => handleModuleComplete(activeModule._id || activeModule.title)}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-24 text-center text-slate-900 border border-slate-200 shadow-sm relative z-10">
                    <PlayCircle size={80} className="mx-auto mb-6 text-slate-300" />
                    <h3 className="text-xl font-bold mb-2">Interactive Module</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">This module focuses on assignments and reading resources to solidify your learning.</p>
                  </div>
                )}
              </section>

              {/* Module Metadata & Activities */}
              <div className="space-y-10">
                <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{activeModule?.title}</h2>
                      {isModuleCompleted && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-xl text-xs font-bold border border-success/20 uppercase tracking-wider">
                          <CheckCircle size={16} /> Completed
                        </div>
                      )}
                    </div>

                    {activeModule?.description && (
                      <div className="bg-slate-50 p-6 rounded-xl border-l-4 border-primary text-slate-700 leading-relaxed text-base mb-8 shadow-sm">
                        <div className="text-xs font-bold uppercase text-primary mb-2 tracking-wider">Instructor Guidelines</div>
                        {activeModule.description}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {activeModule?.pdfUrl && (
                        <div className="bg-white rounded-xl p-8 border border-slate-200 flex flex-col items-center text-center hover:bg-slate-50 transition-colors shadow-sm">
                          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                            <FileText size={32} />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">Module Notes</h3>
                          <p className="text-slate-500 text-sm mb-8 font-medium">Access in-depth documentation and study guides.</p>
                          <button
                            onClick={() => window.open(activeModule.pdfUrl, '_blank')}
                            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
                          >
                            <ExternalLink size={18} /> Launch Reader
                          </button>
                        </div>
                      )}

                      <div className="bg-white rounded-xl p-8 border border-slate-200 flex flex-col items-center text-center shadow-sm">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${isModuleCompleted ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'}`}>
                          <ShieldCheck size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Engagement</h3>
                        <p className="text-slate-500 text-sm mb-8 font-medium">Verify your mastery to unlock advanced certification.</p>
                        <button
                          onClick={() => handleModuleComplete(activeModule?._id || activeModule?.title)}
                          disabled={isModuleCompleted}
                          className={`w-full py-3 font-bold rounded-xl transition-colors shadow-sm ${isModuleCompleted ? 'bg-success/10 text-success cursor-default border border-success/20' : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                        >
                          {isModuleCompleted ? "Module Verified" : "Confirm Completion"}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Module Quiz Card */}
                {activeModule?.quiz && activeModule.quiz.length > 0 && (
                  <div className="relative">
                    {!isModuleCompleted && activeModule?.videoUrl && (
                      <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/90 rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                          <Lock size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Certification Lock</h4>
                        <p className="text-slate-500 text-sm max-w-sm font-medium">Please finish watching the lecture video to prove your engagement and unlock this assessment.</p>
                      </div>
                    )}

                    <section className={`bg-white rounded-2xl p-8 border border-slate-200 shadow-sm ${(!isModuleCompleted && activeModule?.videoUrl) ? 'opacity-30' : ''}`}>
                      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                          <div className="p-2 bg-accent/10 rounded-xl text-accent"><HelpCircle size={24} /></div>
                          Mastery Check
                        </h3>
                        {existingResult && (
                          <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 uppercase tracking-wider ${existingResult.passed ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                            {existingResult.passed ? <Award size={16} /> : <AlertTriangle size={16} />}
                            {existingResult.passed ? 'Certified' : 'Re-attempt Required'} ({existingResult.score}/{existingResult.totalQuestions})
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        {activeModule.quiz.map((q, idx) => (
                          <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <p className="text-base font-medium text-slate-900 mb-4 flex items-start gap-3">
                              <span className="text-primary font-bold">{idx + 1}.</span>
                              <span>{q.question}</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = quizAnswers[idx] === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    disabled={existingResult?.passed}
                                    className={`text-left p-4 rounded-xl border transition-colors text-sm font-medium flex items-center gap-3 ${isSelected
                                        ? 'bg-primary/5 border-primary text-slate-900'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                      }`}
                                    onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: oIdx })}
                                  >
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border ${isSelected ? 'bg-primary text-white border-primary' : 'bg-slate-100 border-slate-200'}`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </div>
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {(!existingResult || !existingResult.passed) && (
                        <button
                          onClick={handleQuizSubmit}
                          className="mt-8 w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 text-base shadow-sm"
                        >
                          {existingResult ? <RotateCcw size={20} /> : <CheckCircle size={20} />}
                          {existingResult ? 'Re-start Assessment' : 'Submit Assessment'}
                        </button>
                      )}
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Module Selection Sidebar */}
          <div className="w-full lg:w-[350px] bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden shadow-lg z-20">
            <div className="p-10 border-b border-slate-200 bg-white">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen size={20} className="text-primary" /> Curriculum
              </h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-2">{data.course.modules.length} Modules</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar pb-40 bg-slate-50">
              {data.course.modules.map((module, index) => {
                const completed = progressData.completedModules.includes(module._id || module.title);
                const active = activeModuleIndex === index;
                const quizResult = progressData.quizResults?.find(r => r.moduleId === (module._id || module.title));

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveModuleIndex(index);
                      setQuizAnswers({});
                    }}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl transition-colors border ${active
                        ? 'bg-white border-primary shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-slate-100'
                      }`}
                  >
                    <div className={`mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                      {completed ? <CheckCircle size={20} /> : index + 1}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className={`text-sm font-bold leading-tight mb-1.5 ${active ? 'text-slate-900' : 'text-slate-600'}`}>
                        {module.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${active ? 'text-primary' : 'text-slate-500'}`}>{module.duration || 'Session'}</span>
                        {quizResult && (
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 ${quizResult.passed ? 'text-success' : 'text-danger'}`}>
                            {quizResult.passed ? 'Certified' : 'Retake'}
                          </span>
                        )}
                      </div>
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
