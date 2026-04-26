import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, BookOpen, Users, Award, ArrowRight, Menu, X } from 'lucide-react';

const Landing = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-dark-50 text-dark-900 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 sm:px-8 py-4 bg-white border-b border-dark-200 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl sm:text-2xl">
          <Rocket className="text-primary" size={28} />
          <span>Eduscale</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/login" className="font-medium text-dark-600 hover:text-primary transition-colors">Log in</Link>
          <Link to="/register" className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all shadow-sm hover:shadow-md active:scale-[0.98]">
            Get Started
          </Link>
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className="md:hidden p-2 text-dark-600 hover:bg-dark-100 rounded-md"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[65px] bg-white z-40 md:hidden flex flex-col p-6 animate-in slide-in-from-top duration-300">
          <Link
            to="/login"
            className="text-lg font-medium py-4 border-b border-dark-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-lg font-bold text-primary py-4 border-b border-dark-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <header className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-white to-dark-50">
        <div className="inline-block px-4 py-1.5 mb-8 text-xs sm:text-sm font-semibold text-accent bg-accent-light rounded-full border border-accent/10">
          Platform version 2.0 is live 🚀
        </div>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-[1.1]">
          Scale your learning with <span className="text-primary">confidence.</span>
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-dark-600 mb-10 max-w-2xl mx-auto">
          Eduscale provides high-performance, robust learning environments capable of handling massive traffic spikes during exams and live sessions without downtime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link to="/register" className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-2 text-lg">
            Start Learning Now <ArrowRight size={20} />
          </Link>
          <a href="#features" className="px-8 py-4 bg-white text-dark-900 border border-dark-200 font-bold rounded-xl hover:bg-dark-100 transition-all active:scale-[0.98] flex items-center justify-center text-lg">
            View Features
          </a>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-dark-900 sm:text-4xl">Why choose Eduscale?</h2>
            <p className="mt-4 text-lg text-dark-600">Built from the ground up for stability and scale.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-dark-50 border border-dark-200 hover:shadow-xl hover:shadow-dark-200/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-accent-light rounded-2xl flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">High Concurrency</h3>
              <p className="text-dark-600 leading-relaxed">
                Never worry about crashes during exams. Our auto-scaling infrastructure handles sudden traffic surges effortlessly.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-dark-50 border border-dark-200 hover:shadow-xl hover:shadow-dark-200/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <BookOpen size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Rich Content</h3>
              <p className="text-dark-600 leading-relaxed">
                Access premium courses across various domains including Web Development, AI/ML, and Mobile App Development.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-dark-50 border border-dark-200 hover:shadow-xl hover:shadow-dark-200/50 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <Award size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Zero Downtime</h3>
              <p className="text-dark-600 leading-relaxed">
                We utilize rolling updates and load balancing to ensure the platform is available 24/7, even during maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-dark-400 py-16 px-6 text-center">
        <div className="flex items-center justify-center gap-2 font-bold text-2xl text-white mb-6">
          <Rocket className="text-primary" size={28} />
          <span>Eduscale</span>
        </div>
        <p className="mb-8 max-w-md mx-auto leading-relaxed text-dark-300">
          Empowering students through scalable education. High-performance learning for the next generation.
        </p>
        <div className="w-full max-w-2xl mx-auto h-px bg-dark-800 mb-8" />
        <div className="text-sm font-medium">
          &copy; {new Date().getFullYear()} Eduscale Learning Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
