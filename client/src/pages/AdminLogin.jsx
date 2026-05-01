import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import api from '../utils/axiosInstance';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token, user } = res.data;

      if (user.role !== 'admin') {
        setError('Access denied. This account does not have administrator privileges.');
        setLoading(false);
        return;
      }

      // Use the standard storage keys
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // We need to refresh the page or manually update context if we don't have a setUser exposed
      // But the best way is to update AuthContext to expose setUser or use the login logic.
      window.location.href = '/admin'; 
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative background for Admin */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="w-full max-w-md z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-dark-400 hover:text-white transition-colors font-medium">
          <ArrowLeft size={20} /> Exit Admin Portal
        </Link>
        
        <div className="bg-white/5 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl border border-white/10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/30">
              <ShieldAlert size={40} className="text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Admin Portal</h1>
            <p className="text-dark-400">Authorized Personnel Only</p>
          </div>
          
          {error && (
            <div className="bg-danger/10 text-danger p-4 rounded-xl text-sm mb-8 border border-danger/20 flex items-start gap-3">
              <ShieldAlert size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-dark-300 mb-2 uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <input 
                  type="email" id="email" required 
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-dark-300 mb-2 uppercase tracking-wider">Security Key</label>
              <div className="relative">
                <input 
                  type="password" id="password" required 
                  className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
              </div>
            </div>
            <button 
              type="submit" disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Secure Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
