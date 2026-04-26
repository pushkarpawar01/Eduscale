import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/axiosInstance';
import { BookOpen, Menu, Rocket } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/api/content/list');
        setCourses(res.data);
      } catch (error) {
        console.error('Failed to fetch courses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-dark-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 font-bold text-xl text-dark-900">
          <Rocket className="text-primary" size={24} />
          <span>Eduscale</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-dark-100 rounded-md text-dark-600"
        >
          <Menu size={24} />
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-8 flex flex-col min-w-0">
        <div className="flex justify-between items-center mb-8">
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-dark-900">
            <BookOpen size={28} className="text-accent" />
            All Courses
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-dark-500">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-dark-200 rounded-full"></div>
              <p>Loading courses...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-8">
            {courses.map(course => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
