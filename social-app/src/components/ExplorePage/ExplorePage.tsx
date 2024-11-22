'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getPosts } from '@/services/apiPosts';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/firebase'; 
import { FaRegComment, FaHeart } from 'react-icons/fa'; 
import Style from './explorepage.module.css';
import Loader from '../ui/Loader';

export default function ExplorePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();

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
    const fetchPosts = async () => {
      try {
        const data = await getPosts();
        if (Array.isArray(data)) {
          const postsWithImages = await Promise.all(
            data.map(async (post) => {
              if (post.image) {
                try {
                  const imageRef = ref(storage, post.image);
                  post.imageUrl = await getDownloadURL(imageRef);
                } catch (error) {
                  console.error('Image fetch error:', error);
                  post.imageUrl = '';
                }
              }
              return post;
            })
          );
          const sortedPosts = postsWithImages.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
  
          setPosts(sortedPosts);
        } else {
          throw new Error('Data is not an array');
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPosts();
  }, []);
  

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handlePostClick = (postId: string) => {
    router.push(`/p/${postId}`);
  };

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={Style.exploreArea}>
      <div className={Style.categories}>
        <button 
          key="all" 
          onClick={() => handleCategoryChange('all')}
          className={selectedCategory === 'all' ? Style.activeCategory : ''}
        >
          All
        </button>
        {categories.map((category) => (
          <button 
            key={category} 
            onClick={() => handleCategoryChange(category)}
            className={selectedCategory === category ? Style.activeCategory : ''}
          >
            {category}
          </button>
        ))}
      </div>

      <div className={Style.postsArea}>
        {filteredPosts.length === 0 ? (
          <p>No posts available</p>
        ) : (
          filteredPosts.map(post => (
            <div key={post._id} className={Style.postBox} onClick={() => handlePostClick(post._id)}>
              <div style={{ position: 'relative', width: '300px', height: '300px' }}>
                {post.imageUrl ? (
                  <Image 
                    src={post.imageUrl} 
                    alt="Post image" 
                    layout="fill" 
                    objectFit="cover" 
                    objectPosition="center" 
                  />
                ) : (
                  <p>No Image</p>
                )}
              </div>
              <div className={Style.overlay}>
                <div className={Style.iconContainer}>
                  <FaHeart className={Style.icon} />
                  <span>{post.likes?.length}</span>
                </div>
                <div className={Style.iconContainer}>
                  <FaRegComment className={Style.icon} />
                  <span>{post.comments?.length}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
