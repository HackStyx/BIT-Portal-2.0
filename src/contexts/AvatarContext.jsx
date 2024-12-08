import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AvatarContext = createContext();

export function AvatarProvider({ children }) {
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatar = async () => {
      const usn = localStorage.getItem('studentUSN');
      if (!usn) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/profile-image/${usn}`
        );
        
        if (response.data.success) {
          setAvatar(response.data.imageUrl);
          localStorage.setItem(`avatar_${usn}`, response.data.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
        // Try to get from localStorage as fallback
        const savedAvatar = localStorage.getItem(`avatar_${usn}`);
        if (savedAvatar) {
          setAvatar(savedAvatar);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, []);

  const updateAvatar = async (imageUrl) => {
    const usn = localStorage.getItem('studentUSN');
    if (!usn) return;

    try {
      const response = await axios.put(
        `http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/profile-image`,
        {
          usn,
          imageUrl
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setAvatar(imageUrl);
        localStorage.setItem(`avatar_${usn}`, imageUrl);
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };

  const clearAvatar = () => {
    const usn = localStorage.getItem('studentUSN');
    if (usn) {
      localStorage.removeItem(`avatar_${usn}`);
    }
    setAvatar(null);
  };

  return (
    <AvatarContext.Provider 
      value={{ 
        avatar, 
        setAvatar, 
        loading, 
        updateAvatar,
        clearAvatar 
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}

export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};