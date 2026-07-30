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
              <h1 className="font-black text-xl truncate tracking-tight text-slate-900">{data.course.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Module {activeModuleIndex + 1}: {activeModule?.title}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 shrink-0">
            <div className="hidden sm:flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Course Progress</span>
              <div className="flex items-center gap-3">
                <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                  <div className="bg-primary h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(249,115,22,0.4)]" style={{ width: `${progressData.progress}%` }} />
                </div>
                <span className="text-xs font-black text-primary font-mono">{progressData.progress}%</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50 no-scrollbar pb-32">
            <div className="max-w-6xl mx-auto p-4 sm:p-10 space-y-10">

              {/* Video Component Section */}
              <section className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition-opacity" />
                {activeModule?.videoUrl ? (
                  <div className="rounded-[2rem] overflow-hidden shadow-xl border border-slate-200 bg-black aspect-video relative z-10">
                    <VideoPlayer
                      src={activeModule.videoUrl}
                      onEnded={() => handleModuleComplete(activeModule._id || activeModule.title)}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-[2rem] p-24 text-center text-slate-900 border border-slate-200 shadow-sm relative z-10">
                    <PlayCircle size={80} className="mx-auto mb-6 text-slate-300" />
                    <h3 className="text-2xl font-black mb-2 tracking-tight">Interactive Module</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">This module focuses on assignments and reading resources to solidify your learning.</p>
                  </div>
                )}
              </section>

              {/* Module Metadata & Activities */}
              <div className="space-y-10">
                <section className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <BookOpen size={240} className="text-slate-900" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                      <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{activeModule?.title}</h2>
                      {isModuleCompleted && (
                        <div className="flex items-center gap-3 px-6 py-2.5 bg-success/10 text-success rounded-2xl text-xs font-black border border-success/20 uppercase tracking-widest shadow-sm">
                          <CheckCircle size={16} /> Completed
                        </div>
                      )}
                    </div>

                    {activeModule?.description && (
                      <div className="bg-slate-50 p-10 rounded-[2.5rem] border-l-8 border-primary text-slate-700 leading-relaxed text-xl mb-12 shadow-sm">
                        <div className="text-[11px] font-black uppercase text-primary mb-4 tracking-[0.4em]">Instructor Guidelines</div>
                        {activeModule.description}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Reading Materials */}
                      {activeModule?.pdfUrl && (
                        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 flex flex-col items-center text-center group hover:bg-primary/[0.03] hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-md">
                          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 border border-primary/20 text-primary shadow-sm group-hover:scale-110 transition-transform">
                            <FileText size={40} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 mb-3">Module Notes</h3>
                          <p className="text-slate-500 text-sm mb-10 font-medium">Access in-depth documentation and study guides.</p>
                          <button
                            onClick={() => window.open(activeModule.pdfUrl, '_blank')}
                            className="w-full py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-black rounded-3xl transition-all flex items-center justify-center gap-3 border border-slate-200 shadow-sm"
                          >
                            <ExternalLink size={20} /> Launch Reader
                          </button>
                        </div>
                      )}

                      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 flex flex-col items-center text-center shadow-sm">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 border ${isModuleCompleted ? 'bg-success/10 border-success/30 text-success' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                          <ShieldCheck size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">Engagement</h3>
                        <p className="text-slate-500 text-sm mb-10 font-medium">Verify your mastery to unlock advanced certification.</p>
                        <button
                          onClick={() => handleModuleComplete(activeModule?._id || activeModule?.title)}
                          disabled={isModuleCompleted}
                          className={`w-full py-5 font-black rounded-3xl transition-all shadow-sm ${isModuleCompleted ? 'bg-success/5 text-success cursor-default border border-success/10' : 'bg-slate-900 text-white hover:bg-slate-800'
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
                      <div className="absolute inset-0 z-20 backdrop-blur-xl bg-white/80 rounded-[3.5rem] flex flex-col items-center justify-center text-center p-12 border border-slate-200 shadow-lg">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-8 border border-slate-200 text-slate-400">
                          <Lock size={40} />
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Certification Lock</h4>
                        <p className="text-slate-500 text-base max-w-sm font-medium">Please finish watching the lecture video to prove your engagement and unlock this assessment.</p>
                      </div>
                    )}

                    <section className={`bg-white rounded-[3.5rem] p-12 border border-slate-200 shadow-lg ${(!isModuleCompleted && activeModule?.videoUrl) ? 'opacity-10' : ''}`}>
                      <div className="flex items-center justify-between mb-12 border-b border-slate-100 pb-8">
                        <h3 className="text-3xl font-black text-slate-900 flex items-center gap-5">
                          <div className="p-4 bg-accent/10 rounded-3xl text-accent border border-accent/20"><HelpCircle size={32} /></div>
                          Mastery Check
                        </h3>
                        {existingResult && (
                          <div className={`px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-3 shadow-sm uppercase tracking-widest ${existingResult.passed ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                            {existingResult.passed ? <Award size={18} /> : <AlertTriangle size={18} />}
                            {existingResult.passed ? 'Certified' : 'Re-attempt Required'} ({existingResult.score}/{existingResult.totalQuestions})
                          </div>
                        )}
                      </div>

                      <div className="space-y-10">
                        {activeModule.quiz.map((q, idx) => (
                          <div key={idx} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <p className="text-xl font-bold text-slate-900 mb-8 flex items-start gap-4">
                              <span className="text-primary font-black">0{idx + 1}.</span>
                              <span>{q.question}</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = quizAnswers[idx] === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    disabled={existingResult?.passed}
                                    className={`text-left p-6 rounded-3xl border-2 transition-all text-sm font-bold flex items-center gap-5 shadow-sm ${isSelected
                                        ? 'bg-primary/10 border-primary text-slate-900 shadow-primary/10'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                      }`}
                                    onClick={() => setQuizAnswers({ ...quizAnswers, [idx]: oIdx })}
                                  >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border transition-all ${isSelected ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-100 border-slate-200'}`}>
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
                          className="mt-12 w-full py-6 bg-primary text-white font-black rounded-[2rem] hover:bg-primary-hover transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-4 text-lg active:scale-[0.98]"
                        >
                          {existingResult ? <RotateCcw size={24} /> : <CheckCircle size={24} />}
                          {existingResult ? 'Re-start Assessment' : 'Finalize & Submit'}
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
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
                <BookOpen size={28} className="text-primary" /> Curriculum
              </h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-3">{data.course.modules.length} Specialized Modules</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar pb-40 bg-slate-50">
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
                    className={`w-full flex items-start gap-5 p-6 rounded-[2rem] transition-all duration-500 border-2 group ${active
                        ? 'bg-white border-primary shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-slate-100 hover:border-slate-200'
                      }`}
                  >
                    <div className={`mt-0.5 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black transition-all duration-500 ${active ? 'bg-primary text-white shadow-md rotate-3' : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                      {completed ? <CheckCircle size={24} /> : index + 1}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className={`text-base font-black leading-tight mb-2 transition-colors duration-500 ${active ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                        {module.title}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-primary' : 'text-slate-400'}`}>{module.duration || 'Session'}</span>
                        {quizResult && (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm ${quizResult.passed ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
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
