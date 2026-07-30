import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/axiosInstance';
import { BookOpen, Menu, Rocket, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CourseCard from '../components/CourseCard';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useContext(AuthContext);

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (course.category && course.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, enrollmentRes] = await Promise.all([
          api.get('/api/content/list'),
          api.get('/api/enrollment/my-courses')
        ]);
        setCourses(coursesRes.data);
        setEnrolledIds(enrollmentRes.data.map(e => e.course._id));
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-dark-900">
            <BookOpen size={28} className="text-primary" />
            Explore All Courses
          </h1>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-white border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-dark-500">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-dark-200 rounded-full"></div>
              <p>Loading your catalog...</p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dark-200 shadow-sm text-center p-6">
            <Search className="text-dark-200 mb-4" size={48} />
            <h2 className="text-xl font-bold text-dark-900">No courses found</h2>
            <p className="text-dark-500 mt-2">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-8">
            {filteredCourses.map(course => (
              <CourseCard 
                key={course._id} 
                course={course} 
                isEnrolled={enrolledIds.includes(course._id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
