import React, { createContext, useContext, useState, useEffect } from 'react';

const AvatarContext = createContext();

export function AvatarProvider({ children }) {
  const [avatar, setAvatar] = useState(() => {
    const usn = localStorage.getItem('studentUSN');
    const savedAvatar = usn ? localStorage.getItem(`avatar_${usn}`) : null;
    console.log('Initial avatar load:', savedAvatar ? 'Found' : 'Not found');
    return savedAvatar;
  });

  // Debug effect
  useEffect(() => {
    console.log('Avatar context value:', avatar);
  }, [avatar]);

  const updateAvatar = (newAvatar) => {
    console.log('Updating avatar...');
    const usn = localStorage.getItem('studentUSN');
    if (usn) {
      localStorage.setItem(`avatar_${usn}`, newAvatar);
      setAvatar(newAvatar);
      console.log('Avatar updated successfully');
    }
  };

  return (
    <AvatarContext.Provider value={{ avatar, updateAvatar }}>
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
