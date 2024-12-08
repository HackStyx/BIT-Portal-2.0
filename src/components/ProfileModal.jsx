import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useAvatar } from '../contexts/AvatarContext';
import axios from 'axios';

export function ProfileModal({ 
  isOpen, 
  onClose, 
  studentData, 
  theme 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const { avatar, updateAvatar } = useAvatar();

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'student_profiles');

      const cloudinaryResponse = await axios.post(
        'https://api.cloudinary.com/v1_1/dpgsv7n88/image/upload',
        formData
      );

      if (cloudinaryResponse.data.secure_url) {
        await updateAvatar(cloudinaryResponse.data.secure_url);
        onClose();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl p-8 max-w-2xl w-full mx-4 relative shadow-2xl transform transition-all duration-300 ease-out ${
        theme === 'dark' ? 'bg-[#1A1A1A]/95' : 'bg-white/95'
      }`}>
        <button 
          onClick={onClose}
          className={`absolute top-6 right-6 p-2 rounded-full transition-colors duration-200 ${
            theme === 'dark' 
              ? 'text-gray-400 hover:text-white hover:bg-white/10' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className={`text-2xl font-bold mb-8 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>Profile Details</h2>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
            <div className="relative w-36 h-36 rounded-full overflow-hidden mb-4 ring-4 ring-opacity-20 ${
              theme === 'dark' ? 'ring-white' : 'ring-black'
            }">
              <img 
                src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentData?.name || '')}&size=144`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <label className={`absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-all duration-200 ${
                isUploading ? 'bg-black/80' : 'bg-black/60 hover:backdrop-blur-sm'
              }`}>
                {isUploading ? (
                  <span className="text-white font-medium">Uploading...</span>
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
              className={`text-sm font-medium px-4 py-2 rounded-full transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10' 
                  : 'text-blue-600 hover:text-blue-500 hover:bg-blue-50'
              }`}
              onClick={() => document.querySelector('input[type="file"]').click()}
              disabled={isUploading}
            >
              Change Photo
            </button>
          </div>

          {/* Student details */}
          <div className="flex-1 space-y-6">
            {['Full Name', 'USN', 'Branch'].map((label, index) => (
              <div key={label}>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {label}
                </label>
                <input 
                  type="text" 
                  value={
                    label === 'Full Name' ? studentData?.name :
                    label === 'USN' ? studentData?.usn :
                    studentData?.department
                  }
                  readOnly
                  className={`w-full rounded-lg px-4 py-3 transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'bg-white/5 border border-white/10 text-white focus:border-white/20' 
                      : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-gray-300'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
