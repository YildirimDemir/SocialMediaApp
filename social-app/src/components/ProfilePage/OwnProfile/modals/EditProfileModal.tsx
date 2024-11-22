'use client';

import React, { useEffect, useState } from 'react';
import Style from '../../profilepage.module.css';
import { updateProfile } from '@/services/apiUsers';
import { toast } from 'react-toastify';
import { IUser } from '@/models/userModel';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  onUpdate: (updatedUser: IUser) => void; 
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [username, setUsername] = useState(user?.username);
  const [name, setName] = useState(user?.name);
  const [bio, setBio] = useState(user?.bio);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setName(user.name);
      setBio(user.bio);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!username || !name || !bio) {
      toast.error('All fields are required.');
      return;
    }

    setIsLoading(true);

    try {
      const updatedUser = await updateProfile({
        id: user._id,
        username,
        name,
        bio,
      });

      toast.success('Profile updated successfully!');
      onUpdate(updatedUser);
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`${Style.editModal} ${isOpen ? '' : Style.closed}`}>
      <div className={Style.editSection}>
        <h3>Edit Profile</h3>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={Style.inputBox}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username here..."
            />
          </div>
          <div className={Style.inputBox}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name here..."
            />
          </div>
          <div className={Style.inputBox}>
            <label htmlFor="bio">Bio</label>
            <input
              type="text"
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter your bio here...(Max: 150c.)"
            />
          </div>
          <button type="button" className={Style.btn} onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Confirm'}
          </button>
        </form>
        <button className={Style.closeBtn} onClick={onClose}>
          X
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;
