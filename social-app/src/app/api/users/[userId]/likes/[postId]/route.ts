import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/mongodb'; 
import User from '@/models/userModel'; 
import Post from '@/models/postModel'; 

export async function POST(req: NextRequest, { params }: { params: { userId: string; postId: string } }) {
    try {
        await connectToDB();

        const { userId, postId } = params;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const postObjectId = new mongoose.Types.ObjectId(postId);

        const user = await User.findById(userObjectId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const post = await Post.findById(postObjectId);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        if (!user.likes?.includes(postObjectId)) {
            user.likes = [...(user.likes || []), postObjectId];
        }

        if (!post.likes?.includes(userObjectId)) {
            post.likes = [...(post.likes || []), userObjectId];
        }

        await user.save();
        await post.save();

        return NextResponse.json({ message: 'Like added', user, post }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error adding like:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ message: 'Failed to add like', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { userId: string; postId: string } }) {
    try {
        await connectToDB();

        const { userId, postId } = params;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const postObjectId = new mongoose.Types.ObjectId(postId);

        const user = await User.findById(userObjectId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const post = await Post.findById(postObjectId);
        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        user.likes = user.likes?.filter(like => like.toString() !== postObjectId.toString()) || [];
        post.likes = post.likes?.filter(like => like.toString() !== userObjectId.toString()) || [];

        await user.save();
        await post.save();

        return NextResponse.json({ message: 'Like removed', user, post }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error removing like:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ message: 'Failed to remove like', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}