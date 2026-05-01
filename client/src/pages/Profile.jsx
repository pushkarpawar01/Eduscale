import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axiosInstance';
import Sidebar from '../components/Sidebar';
import { User, Mail, Phone, Book, GraduationCap, Save, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', 
    college: '', degree: '', skills: '', interests: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/auth/me'); // Using the auth me route to get full user data
        const data = res.data;
        setFormData({
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          college: data.college || '',
          degree: data.degree || '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          interests: Array.isArray(data.interests) ? data.interests.join(', ') : ''
        });
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const formattedData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
      };
      
      await api.put('/api/auth/profile', formattedData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-dark-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 flex flex-col min-w-0">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
            <User className="text-primary" size={28} /> Update Profile
          </h1>
          <p className="text-dark-500 mt-1">Keep your information up to date</p>
        </header>

        <div className="max-w-4xl bg-white rounded-2xl border border-dark-200 shadow-sm overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-dark-200 flex items-center gap-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary border-4 border-white shadow-md">
              <User size={40} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-dark-900">{formData.name}</h2>
              <p className="text-dark-500">{formData.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10">
            {message && (
              <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${
                message.includes('Error') ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'
              }`}>
                {message.includes('Error') ? <HelpCircle size={20} /> : <CheckCircle size={20} />}
                <span className="font-bold">{message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-bold text-dark-900 border-b border-dark-100 pb-2">Personal Information</h3>
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-dark-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input 
                      id="name" type="text" value={formData.name} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-dark-700 mb-2">Email Address (Locked)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input 
                      id="email" type="email" value={formData.email} disabled
                      className="w-full pl-10 pr-4 py-3 bg-dark-100 border border-dark-200 rounded-xl text-dark-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-bold text-dark-700 mb-2">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input 
                      id="mobile" type="tel" value={formData.mobile} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-dark-900 border-b border-dark-100 pb-2">Academic & Professional</h3>
                <div>
                  <label htmlFor="college" className="block text-sm font-bold text-dark-700 mb-2">College / University</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input 
                      id="college" type="text" value={formData.college} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="degree" className="block text-sm font-bold text-dark-700 mb-2">Degree</label>
                  <div className="relative">
                    <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                    <input 
                      id="degree" type="text" value={formData.degree} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="skills" className="block text-sm font-bold text-dark-700 mb-2">Skills (Comma separated)</label>
                  <input 
                    id="skills" type="text" value={formData.skills} onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-50 border border-dark-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="React, Node.js, Python..."
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <button 
                type="submit" disabled={saving}
                className="px-8 py-4 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                {saving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
