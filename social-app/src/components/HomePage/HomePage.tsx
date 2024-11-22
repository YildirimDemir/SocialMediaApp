'use client';

import React from 'react'
import StoryArea from './StoryArea'
import PostsArea from './PostsArea'
import { getSession } from 'next-auth/react';

export default async function HomePage() {
  return (
    <>
    <StoryArea />
    <PostsArea />
    </>
  )
}