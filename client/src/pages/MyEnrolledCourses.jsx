import React, { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import Sidebar from '../components/Sidebar';
import { Book, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyEnrolledCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await api.get('/api/enrollment/my-courses');
        setEnrollments(res.data);
      } catch (error) {
        console.error('Failed to fetch enrolled courses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 flex flex-col min-w-0">
        <header className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-dark-900">
            <Book size={28} className="text-primary" />
            My Enrolled Courses
          </h1>
          <p className="text-dark-500 mt-1">Pick up where you left off</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dark-200 text-center shadow-sm">
            <Book size={64} className="mx-auto text-dark-200 mb-4" />
            <h2 className="text-xl font-bold text-dark-900">No courses yet</h2>
            <p className="text-dark-500 mt-2">Explore our catalog and start learning today!</p>
            <Link to="/dashboard" className="mt-6 inline-block px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="bg-white rounded-2xl border border-dark-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="relative aspect-video">
                  <img src={enrollment.course.imageUrl} alt={enrollment.course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-dark-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/learn/${enrollment.course._id}`} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white">
                      <PlayCircle size={48} />
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-dark-900 truncate">{enrollment.course.title}</h3>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-dark-500">
                      <Clock size={16} />
                      <span>{enrollment.progress}% Complete</span>
                    </div>
                    {enrollment.completed && (
                      <div className="flex items-center gap-1 text-success font-semibold">
                        <CheckCircle size={16} />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 w-full bg-dark-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                  <Link 
                    to={`/learn/${enrollment.course._id}`}
                    className="mt-6 w-full py-3 bg-dark-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-dark-800 transition-all"
                  >
                    {enrollment.progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyEnrolledCourses;
