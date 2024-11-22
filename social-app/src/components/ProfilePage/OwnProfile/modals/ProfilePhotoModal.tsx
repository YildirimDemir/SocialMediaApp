'use client';

import React, { useEffect, useRef, useState } from 'react';
import Style from '../../profilepage.module.css';
import { IUser } from '@/models/userModel';
import { updateProfilePhoto } from '@/services/apiUsers';
import { uploadFile } from '@/services/apiUpload';
import toast from 'react-hot-toast';
import userIcon from '../../../../../public/images/user-icon.jpg';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  onUpdate: (updatedUser: IUser) => void;
}

const ProfilePhotoModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setImagePreview(user?.profilePhoto);
    }
  }, [user]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profilePhoto) {
      toast.error('All fields are required.');
      return;
    }

    setIsLoading(true);

    try {
      const profilePhotoUrl = await uploadFile(profilePhoto);
      const updatedUser = await updateProfilePhoto({
        id: user._id,
        profilePhoto: profilePhotoUrl,
      });

      toast.success('Profile photo updated successfully!');
      onUpdate(updatedUser);
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile photo. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDefaultPhoto = async () => {
    setIsLoading(true);

    try {
      const updatedUser = await updateProfilePhoto({
        id: user._id,
        profilePhoto: userIcon.src,
      });

      toast.success('Profile photo reset to default!');
      onUpdate(updatedUser);
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Error resetting profile photo:', error);
      toast.error('Failed to reset profile photo. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`${Style.editModal} ${isOpen ? '' : Style.closed}`}>
      <div className={Style.ppUpdateSection}>
        <h3>Update Profile Photo</h3>
        <form onSubmit={handleSubmit}>
          <div className={Style.imageUpload}>
            {imagePreview ? (
              <img src={imagePreview} alt="Image Preview" className={Style.imagePreview} onClick={() => imageInputRef.current?.click()} />
            ) : (
              <div className={Style.imagePlaceholder}>
                <p>Upload Image</p>
              </div>
            )}
            <input
              ref={imageInputRef}
              id="image"
              type="file"
              accept="image/*"
              className={Style.imgInput}
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
          <button className={Style.ppBtn} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </form>
        <button className={Style.defaultBtn} onClick={handleDefaultPhoto} disabled={isLoading}>
          Reset to Default Photo
        </button>
        <button className={Style.closeBtn} onClick={onClose}>
          X
        </button>
      </div>
    </div>
  );
}

export default ProfilePhotoModal;
