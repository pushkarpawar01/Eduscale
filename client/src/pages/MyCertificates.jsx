import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import Sidebar from '../components/Sidebar';
import { Award, Download, Mail, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

const MyCertificates = () => {
  const [completedEnrollments, setCompletedEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailingId, setEmailingId] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await api.get('/api/enrollment/my-courses');
        // Filter only completed courses
        setCompletedEnrollments(res.data.filter(e => e.completed));
      } catch (error) {
        console.error('Failed to fetch certificates', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const handleEmailCertificate = async (enrollmentId) => {
    setEmailingId(enrollmentId);
    try {
      // Mocking certificate email endpoint
      await api.post(`/api/enrollment/certificate/${enrollmentId}/email`);
      alert('Certificate has been sent to your email!');
    } catch (error) {
      alert('Failed to email certificate. Please try again.');
    } finally {
      setEmailingId(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 flex flex-col min-w-0">
        <header className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-dark-900">
            <Award size={28} className="text-accent" />
            My Certificates
          </h1>
          <p className="text-dark-500 mt-1">Celebrate your achievements</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : completedEnrollments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dark-200 text-center shadow-sm">
            <ShieldCheck size={64} className="mx-auto text-dark-200 mb-4" />
            <h2 className="text-xl font-bold text-dark-900">No certificates yet</h2>
            <p className="text-dark-500 mt-2">Complete a course to 100% to earn your official certificate!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {completedEnrollments.map((enrollment) => (
              <div key={enrollment._id} className="bg-white rounded-2xl border-2 border-dark-200 p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                    <Award size={32} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-dark-400 uppercase tracking-widest">Certificate ID</span>
                    <span className="text-xs font-mono text-dark-500">ESC-{enrollment._id.substring(18).toUpperCase()}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-dark-900 mb-2">{enrollment.course.title}</h3>
                <p className="text-dark-500 text-sm mb-6 flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  Completed on {new Date(enrollment.completionDate).toLocaleDateString()}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    className="flex-1 py-3 bg-dark-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-dark-800 transition-all shadow-lg shadow-dark-900/10"
                    onClick={() => alert('Certificate PDF generation feature coming soon!')}
                  >
                    <ExternalLink size={18} /> View Certificate
                  </button>
                  <button 
                    disabled={emailingId === enrollment._id}
                    onClick={() => handleEmailCertificate(enrollment._id)}
                    className="flex-1 py-3 bg-white border-2 border-dark-200 text-dark-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-dark-50 transition-all disabled:opacity-50"
                  >
                    {emailingId === enrollment._id ? (
                      <div className="w-5 h-5 border-2 border-dark-400 border-t-dark-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail size={18} /> Email Me
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCertificates;
