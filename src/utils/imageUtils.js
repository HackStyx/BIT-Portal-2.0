export const saveProfilePicture = async (file, usn) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('usn', usn);

    const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/upload-profile-picture`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error uploading image');
    }

    const data = await response.json();
    
    if (data.success) {
      return `http://localhost:${process.env.REACT_APP_SERVER_PORT}${data.imageUrl}`;
    } else {
      throw new Error(data.message || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Error saving profile picture:', error);
    throw error;
  }
};

export const getProfilePicture = async (usn) => {
  try {
    const response = await fetch(`http://localhost:${process.env.REACT_APP_SERVER_PORT}/api/get-profile-picture/${usn}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile picture');
    }

    const data = await response.json();
    
    if (data.success) {
      return `http://localhost:${process.env.REACT_APP_SERVER_PORT}${data.imageUrl}`;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return null;
  }
};
