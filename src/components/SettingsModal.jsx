import React from 'react';
import { X, Sun, Moon } from 'lucide-react';
import { Switch } from './ui/switch';

export function SettingsModal({ isOpen, onClose, theme, setTheme }) {
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  if (!isOpen) return null;

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1A1A1A] rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
              <span className="text-gray-200">Dark Mode</span>
            </div>
            <Switch 
              checked={theme === 'dark'}
              onCheckedChange={(checked) => toggleTheme()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
