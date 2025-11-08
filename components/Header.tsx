
import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          Family Bingo Live
        </Link>
        <nav className="flex items-center space-x-4 md:space-x-6">
            <Link to="/rules" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Rules
            </Link>
            <Link to="/faq" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                FAQ
            </Link>
            <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;