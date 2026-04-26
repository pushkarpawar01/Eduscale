import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Rocket, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 p-4 sm:p-6 relative">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-dark-600 hover:text-primary transition-colors font-medium">
          <ArrowLeft size={20} /> Back to Home
        </Link>
        
        <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-dark-100">
        <div className="text-center mb-8">
          <Rocket size={48} className="mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold text-dark-900 mb-1">Welcome Back</h1>
          <p className="text-dark-600">Login to Eduscale to continue</p>
        </div>
        
        {error && <div className="bg-red-50 text-danger p-3 rounded-md text-sm mb-6 text-center">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-dark-900 mb-1">Email Address</label>
            <input 
              type="email" 
              id="email" 
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-dark-900 mb-1">Password</label>
            <input 
              type="password" 
              id="password" 
              className="w-full p-3 border border-dark-200 rounded-md focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-light transition-all" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full p-3 mt-4 bg-primary hover:bg-primary-hover text-white rounded-md font-semibold transition-colors duration-150">
            Login to Dashboard
          </button>
        </form>
        
        <div className="text-center mt-6 text-sm text-dark-600">
          <p>Don't have an account? <Link to="/register" className="text-primary font-medium">Register here</Link></p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
