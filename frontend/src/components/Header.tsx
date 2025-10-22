import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Example: simulate userRole and token from localStorage inside component
  const userRole = localStorage.getItem('userRole') || '';
  const token = localStorage.getItem('token') || '';

  // Example notification count state, replace with your hook or logic
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Debug/logging effect, runs on userRole, token or unreadCount change
    console.log('🔍 Debug Notifications:');
    console.log('- User Role:', userRole);
    console.log('- Token:', token ? 'Present' : 'Missing');
    console.log('- Unread Count:', unreadCount);
  }, [userRole, token, unreadCount]);

  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-blue-700/50 shadow-2xl">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 select-none group">
          <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
            GPIT
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 font-medium">
          <Link to="/" className="text-blue-300 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/5">
            Accueil
          </Link>
          <Link to="/features" className="text-blue-300 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/5">
            Fonctionnalités
          </Link>
          <Link to="/about" className="text-blue-300 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/5">
            À propos
          </Link>
          <Link to="/contact" className="text-blue-300 hover:text-white transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/5">
            Contact
          </Link>
        </nav>

        {/* Desktop Login Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg hover:from-blue-500 hover:to-blue-400 hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Se Connecter
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-xl font-semibold text-blue-400 border border-blue-500 hover:bg-blue-600 hover:text-white transition-all duration-300"
          >
            S'inscrire
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="md:hidden text-blue-300 hover:text-white transition-all duration-300 p-2 rounded-lg hover:bg-white/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Fermer menu' : 'Ouvrir menu'}
        >
          {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-blue-700/30">
          <nav className="flex flex-col space-y-1 px-6 py-4">
            <Link to="/" className="text-blue-300 hover:text-white transition-all duration-300 px-4 py-3 rounded-lg hover:bg-white/5 font-medium" onClick={() => setIsMenuOpen(false)}>
              Accueil
            </Link>
            <Link to="/features" className="text-blue-300 hover:text-white transition-all duration-300 px-4 py-3 rounded-lg hover:bg-white/5 font-medium" onClick={() => setIsMenuOpen(false)}>
              Fonctionnalités
            </Link>
            <Link to="/about" className="text-blue-300 hover:text-white transition-all duration-300 px-4 py-3 rounded-lg hover:bg-white/5 font-medium" onClick={() => setIsMenuOpen(false)}>
              À propos
            </Link>
            <Link to="/contact" className="text-blue-300 hover:text-white transition-all duration-300 px-4 py-3 rounded-lg hover:bg-white/5 font-medium" onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>

            <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-blue-700/30">
              <Link
                to="/login"
                className="px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 text-center hover:from-blue-500 hover:to-blue-400 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Se Connecter
              </Link>
              <Link
                to="/register"
                className="px-4 py-3 rounded-xl font-semibold text-blue-400 border border-blue-500 text-center hover:bg-blue-600 hover:text-white transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                S'inscrire
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
