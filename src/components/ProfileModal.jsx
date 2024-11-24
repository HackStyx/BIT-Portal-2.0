import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useAvatar } from '../contexts/AvatarContext';

export function ProfileModal({ 
  isOpen, 
  onClose, 
  studentData, 
  theme 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const { avatar, updateAvatar } = useAvatar();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        console.log('New image loaded, updating avatar...');
        updateAvatar(base64String);
        setIsUploading(false);
        onClose();
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`rounded-lg p-6 max-w-2xl w-full mx-4 relative ${
        theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-white'
      }`}>
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className={`text-2xl font-bold mb-6 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Profile</h2>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
              <img 
                src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData?.name || '')}&size=128`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <label className={`absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity ${
                isUploading ? 'bg-black/70' : 'bg-black/50'
              }`}>
                {isUploading ? (
                  <span className="text-white">Uploading...</span>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-white" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </>
                )}
              </label>
            </div>
            <button 
              className={`text-sm ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
              onClick={() => document.querySelector('input[type="file"]').click()}
              disabled={isUploading}
            >
              Change Photo
            </button>
          </div>

          {/* Student details */}
          <div className="flex-1 space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Full Name
              </label>
              <input 
                type="text" 
                value={studentData?.name || ''}
                readOnly
                className={`w-full rounded-md px-3 py-2 ${
                  theme === 'dark' 
                    ? 'bg-white/5 border border-white/10 text-white' 
                    : 'bg-gray-100 border border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                USN
              </label>
              <input 
                type="text" 
                value={studentData?.usn || ''}
                readOnly
                className={`w-full rounded-md px-3 py-2 ${
                  theme === 'dark' 
                    ? 'bg-white/5 border border-white/10 text-white' 
                    : 'bg-gray-100 border border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Branch
              </label>
              <input 
                type="text" 
                value={studentData?.department || ''}
                readOnly
                className={`w-full rounded-md px-3 py-2 ${
                  theme === 'dark' 
                    ? 'bg-white/5 border border-white/10 text-white' 
                    : 'bg-gray-100 border border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
