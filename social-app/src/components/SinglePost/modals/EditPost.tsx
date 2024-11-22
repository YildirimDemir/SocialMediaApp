'use client';

import React, { useState, useEffect, useRef } from 'react';
import Style from './editpost.module.css';
import { updatePost } from '@/services/apiPosts';
import { uploadFile } from '@/services/apiUpload';

interface EditPostProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onUpdate: (updatedPost: any) => void; 
}

const EditPost: React.FC<EditPostProps> = ({ isOpen, onClose, post, onUpdate }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const imageInputRef = useRef<HTMLInputElement>(null); 

  const categories = [
    'Sport', 
    'Game', 
    'News', 
    'Technology', 
    'Health', 
    'Education', 
    'Entertainment', 
    'Business', 
    'Politics', 
    'Travel'
  ];

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setCategory(post.category);
      setImagePreview(post.image);
    }
  }, [post]);

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
      let imageUrl = post.image; 
      if (image) {
        imageUrl = await uploadFile(image); 
      }

      const updatedData = {
        content,
        category,
        image: imageUrl,
      };

      await updatePost(post._id, updatedData);
      onUpdate(updatedData);
      onClose(); 
    } catch (error) {
      console.error('Failed to update post:', error);
      setError('Failed to update post');
    }
  };

  return (
    <div className={`${Style.editPostModal} ${isOpen ? '' : Style.closed}`}>
      <div className={Style.editPostSection}>
        <h3>Edit Post</h3>
        <form onSubmit={handleSubmit}>
          <div className={Style.imageUpload} onClick={handleImageClick}>
            {imagePreview ? (
              <img src={imagePreview} alt="Image Preview" className={Style.imagePreview} />
            ) : (
              <div className={Style.imagePlaceholder}><p>Upload Image</p></div>
            )}
            <input
              ref={imageInputRef}
              id="image"
              type="file"
              className={Style.imgInput}
              onChange={handleImageChange}
              style={{ display: 'none' }} 
            />
          </div>
          <div className={Style.categorySelect}>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select a category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className={Style.contentText}>
            <textarea
              id="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder='Write your content here...'
            />
          </div>
          <button type="submit" className={Style.btn}>Update Post</button>
          {error && <p className={Style.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default EditPost;
