'use client';

import { createStory } from '@/services/apiStories';
import { uploadFile } from '@/services/apiUpload';
import React, { useRef, useState } from 'react'
import Style from './story.module.css'

interface StoryModal {
    isOpen: boolean;
    onClose: () => void;
}

const CreateStory: React.FC<StoryModal> = ({isOpen, onClose}) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null); 

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    imageInputRef.current?.click(); 
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
        let imageUrl = '';
        if(image) {
            imageUrl = await uploadFile(image);
        }

        await createStory({text, image: imageUrl});
        setText('')
        setImage(null);
        setImagePreview(null);
        alert('Story created successfully!');
        onClose();
    } catch (error) {
      console.error('Error creating story:', error);
      setError('Failed to create story');
    }
  }

  return (
    <div className={`${Style.storyArea} ${isOpen ? '' : Style.closed}`}>
        <form onSubmit={handleSubmit} className={Style.storyForm}>
            <div className={Style.storyUpload} onClick={handleImageClick}>
              {imagePreview ? (
                <img src={imagePreview} alt="Image Preview" className={Style.imagePreview} />
              ) : (
                <div className={Style.imagePlaceholder}>
                  <p>Upload Image</p>
                </div>
              )}
              <input
                ref={imageInputRef} 
                id="image"
                type="file"
                onChange={handleImageChange}
                style={{ display: 'none' }} 
              />
            </div>
            <div className={Style.storyTextAdd}>
                <input
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder='Write your text here...'
                  maxLength={30}
                />
              </div>
          <div className={Style.uploadStoryBtn}>
            <button type='submit' className={Style.btn}>Share</button>
          </div>
          {error && <p>{error}</p>}
        </form>
        <button onClick={onClose} className={Style.closeBtn}>X</button>
    </div>
  )
}

export default CreateStory;