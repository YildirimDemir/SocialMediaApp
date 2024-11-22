import { NextResponse, NextRequest } from 'next/server';
import Post from '@/models/postModel';
import User from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {

    await connectToDB();


    const userId = new URL(req.url).searchParams.get('userId');


    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    
    const user = await User.findById(userId).populate('following');
    if (!user || !user.following) {
      return NextResponse.json({ error: 'User not found or not following anyone' }, { status: 404 });
    }

    
    const posts = await Post.find({ author: { $in: user.following } })
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username' 
        }
      })
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({ count: posts.length, posts }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching posts:', error.message);
    return NextResponse.json({ error: 'Failed to fetch posts', details: error.message }, { status: 500 });
  }
}
