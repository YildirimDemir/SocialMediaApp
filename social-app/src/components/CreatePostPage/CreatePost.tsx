'use client';

import { useState, useRef } from 'react';
import { createPost } from '@/services/apiPosts';
import { uploadFile } from '@/services/apiUpload';
import Style from './createpost.module.css';

export default function CreatePost() {
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
      if (image) {
        imageUrl = await uploadFile(image);
      }

      await createPost({ content, image: imageUrl, category });
      setContent('');
      setCategory('');
      setImage(null);
      setImagePreview(null);
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post');
    }
  };

  return (
    <div className={Style.createPostPage}>
      <h1>Create New Post</h1>
      <form onSubmit={handleSubmit}>
        <div className={Style.imageUpload} onClick={handleImageClick}>
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
            className={Style.imgInput}
            onChange={handleImageChange}
            style={{ display: 'none' }} 
          />
        </div>

        <div className={Style.categorySelect}>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
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
          ></textarea>
        </div>
        <button type="submit" className={Style.btn}>Create Post</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
}
