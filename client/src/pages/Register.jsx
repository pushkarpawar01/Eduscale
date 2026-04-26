import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Rocket, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', 
    mobile: '', college: '', degree: '', 
    skills: '', interests: ''
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Convert skills and interests from comma-separated strings to arrays
    const formattedData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
    };
    
    const result = await register(formattedData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 p-4 sm:p-6 relative py-12 sm:py-20">
      <div className="w-full max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-dark-600 hover:text-primary transition-colors font-medium">
          <ArrowLeft size={20} /> Back to Home
        </Link>

        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-dark-100">
        <div className="text-center mb-8">
          <Rocket size={48} className="mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold text-dark-900 mb-1">Create an Account</h1>
          <p className="text-dark-600">Join Eduscale and complete your profile</p>
        </div>
        
        {error && <div className="bg-red-50 text-danger p-3 rounded-md text-sm mb-6 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-dark-900 border-b border-dark-200 pb-2 mb-2">Account Details</h3>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-dark-900 mb-1">Full Name *</label>
            <input 
              type="text" id="name" 
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
              value={formData.name} onChange={handleChange} required 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-900 mb-1">Email Address *</label>
            <input 
              type="email" id="email" 
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
              value={formData.email} onChange={handleChange} required 
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark-900 mb-1">Password *</label>
            <input 
              type="password" id="password" 
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
              value={formData.password} onChange={handleChange} required minLength={6}
            />
          </div>
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-dark-900 mb-1">Mobile No.</label>
            <input 
              type="tel" id="mobile" 
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
              value={formData.mobile} onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2 mt-2">
            <h3 className="text-lg font-semibold text-dark-900 border-b border-dark-200 pb-2 mb-2">Education & Profile</h3>
          </div>

          <div>
            <label htmlFor="college" className="block text-sm font-medium text-dark-900 mb-1">College/University</label>
            <input 
              type="text" id="college" 
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
              value={formData.college} onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="degree" className="block text-sm font-medium text-dark-900 mb-1">Degree</label>
            <input 
              type="text" id="degree" placeholder="e.g. B.Tech Computer Science"
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
              value={formData.degree} onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-dark-900 mb-1">Skills (comma-separated)</label>
            <input 
              type="text" id="skills" placeholder="e.g. React, Node.js, Python"
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
              value={formData.skills} onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-dark-900 mb-1">Interests (comma-separated)</label>
            <input 
              type="text" id="interests" placeholder="e.g. AI, Web Dev, Mobile apps"
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
              value={formData.interests} onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full p-3 bg-primary hover:bg-primary-hover text-white rounded-md font-semibold transition-colors duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Complete Sign Up'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-6 text-sm text-dark-600">
          <p>Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link></p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
