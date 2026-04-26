import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Rocket, BookOpen, Star, Book, Award, User, LogOut, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-4 px-6 py-3 rounded-md text-dark-600 font-medium transition-all duration-150 hover:bg-dark-100 hover:text-dark-900 ${isActive ? 'bg-accent-light !text-accent border-l-4 border-accent rounded-l-none pl-[1.375rem]' : ''
    }`;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] bg-white border-r border-dark-200 flex flex-col transition-transform duration-300 ease-in-out shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="px-6 py-6 border-b border-dark-200 flex items-center justify-between font-bold text-xl text-dark-900">
          <div className="flex items-center gap-2">
            <Rocket className="text-primary" size={24} />
            <span>Eduscale</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-dark-100 rounded-md text-dark-500"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="py-6 flex-1 overflow-y-auto no-scrollbar">
          <ul className="px-2 space-y-1">
            <li>
              <NavLink to="/recommended" className={navLinkClass} onClick={() => onClose && onClose()}>
                <Star size={20} /> Recommended Courses
              </NavLink>
            </li>
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
              <NavLink to="/refer" className={navLinkClass} onClick={() => onClose && onClose()}>
                <Rocket size={20} /> Refer & Earn
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={navLinkClass} onClick={() => onClose && onClose()}>
                <User size={20} /> Update Profile
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="p-6 border-t border-dark-200">
          <div className="flex items-center gap-3 mb-6 p-3 bg-dark-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-dark-600 shrink-0 border border-dark-200">
              <User size={20} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <p className="font-semibold text-sm truncate">{user?.name || 'User'}</p>
              <span className="text-xs text-dark-400">Student Account</span>
            </div>
          </div>
          <button
            className="w-full py-3 bg-danger hover:bg-danger-hover text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm active:scale-[0.98]"
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
