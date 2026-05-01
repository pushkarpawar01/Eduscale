import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Rocket, BookOpen, Star, Book, Award, User, LogOut, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-4 px-6 py-3 rounded-xl text-dark-400 font-bold transition-all duration-300 hover:bg-white/5 hover:text-white ${
      isActive ? 'bg-primary/10 !text-primary border-r-4 border-primary rounded-r-none' : ''
    }`;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] bg-dark-900 border-r border-white/5 flex flex-col transition-transform duration-500 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-8 py-8 flex items-center justify-between font-black text-2xl text-white tracking-tighter">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <Rocket className="text-white" size={24} />
            </div>
            <span>Eduscale</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/5 rounded-xl text-dark-400 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="py-6 flex-1 overflow-y-auto no-scrollbar">
          <ul className="px-4 space-y-2">
            {user?.role === 'admin' ? (
              <>
                <li>
                  <NavLink to="/admin" className={navLinkClass} onClick={() => onClose && onClose()}>
                    <BookOpen size={20} /> Manage Courses
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/profile" className={navLinkClass} onClick={() => onClose && onClose()}>
                    <User size={20} /> Admin Profile
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/dashboard" className={navLinkClass} onClick={() => onClose && onClose()}>
                    <BookOpen size={20} /> All Courses
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/enrolled" className={navLinkClass} onClick={() => onClose && onClose()}>
                    <Book size={20} /> My Enrolled Courses
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/certificates" className={navLinkClass} onClick={() => onClose && onClose()}>
                    <Award size={20} /> My Certificates
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/profile" className={navLinkClass} onClick={() => onClose && onClose()}>
                    <User size={20} /> Update Profile
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="p-6 mt-auto">
          <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0 font-black border border-primary/20">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="font-bold text-sm text-white truncate">{user?.name || 'User'}</p>
              <span className="text-[10px] text-dark-500 font-black uppercase tracking-widest">{user?.role || 'Student'} Account</span>
            </div>
          </div>
          <button
            className="w-full py-4 bg-danger/10 hover:bg-danger text-danger hover:text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 border border-danger/20"
            onClick={logout}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
