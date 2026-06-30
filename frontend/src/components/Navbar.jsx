import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
      isActive 
        ? 'text-blue-600 border-b-2 border-blue-600' 
        : 'text-gray-600 hover:text-blue-600'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-3 py-2 text-base font-medium transition-colors flex items-center gap-2 ${
      isActive 
        ? 'text-blue-600 bg-blue-50' 
        : 'text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Job Mail AI</span>
            </div>
            {/* Desktop Menu */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4 items-center">
              <NavLink to="/generator" className={linkClass} end>
                Generate
              </NavLink>
              <NavLink to="/bulk" className={linkClass}>
                Bulk Apply
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold border border-amber-200 ml-1">BETA</span>
              </NavLink>
              <NavLink to="/dashboard" className={linkClass}>
                Applications
              </NavLink>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Guest Workspace
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden gap-4">
            <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-semibold text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Guest
            </div>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden border-t border-gray-200`}>
        <div className="pt-2 pb-3 space-y-1">
          <NavLink to="/generator" className={mobileLinkClass} onClick={closeMenu} end>
            Generate
          </NavLink>
          <NavLink to="/bulk" className={mobileLinkClass} onClick={closeMenu}>
            Bulk Apply
            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold border border-amber-200">BETA</span>
          </NavLink>
          <NavLink to="/dashboard" className={mobileLinkClass} onClick={closeMenu}>
            Applications
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
