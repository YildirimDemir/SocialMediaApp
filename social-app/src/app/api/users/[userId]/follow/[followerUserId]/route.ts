import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/mongodb'; 
import User from '@/models/userModel'; 

export async function POST(req: NextRequest, { params }: { params: { userId: string; followerUserId: string } }) {
    try {
        await connectToDB();

        const { userId, followerUserId } = params;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const followUserObjectId = new mongoose.Types.ObjectId(followerUserId);

        const user = await User.findById(userObjectId);
        const followUser = await User.findById(followUserObjectId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (!followUser) {
            return NextResponse.json({ message: 'User to follow not found' }, { status: 404 });
        }


        if (!user.following?.includes(followUserObjectId)) {
            user.following = [...(user.following || []), followUserObjectId];
        }

        if (!followUser.followers?.includes(userObjectId)) {
            followUser.followers = [...(followUser.followers || []), userObjectId];
        }


        await user.save();
        await followUser.save();

        return NextResponse.json({ message: 'User followed', user, followUser }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error adding follow:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ message: 'Failed to follow user', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { userId: string; followerUserId: string } }) {
    try {
        await connectToDB();

        const { userId, followerUserId } = params;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const followUserObjectId = new mongoose.Types.ObjectId(followerUserId);

        const user = await User.findById(userObjectId);
        const followUser = await User.findById(followUserObjectId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (!followUser) {
            return NextResponse.json({ message: 'User to unfollow not found' }, { status: 404 });
        }


        user.following = user.following?.filter(follow => follow.toString() !== followUserObjectId.toString()) || [];
        followUser.followers = followUser.followers?.filter(follower => follower.toString() !== userObjectId.toString()) || [];

        await user.save();
        await followUser.save();

        return NextResponse.json({ message: 'User unfollowed', user, followUser }, { status: 200 });
    } catch (error: unknown) {
        console.error('Error removing follow:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json({ message: 'Failed to unfollow user', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
