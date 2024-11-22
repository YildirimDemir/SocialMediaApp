import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';

export const DELETE = async (req: NextRequest, { params }: { params: { userId: string, followerId: string } }) => {
    try {
        await connectToDB();

        const { userId, followerId } = params;

        const user = await User.findById(userId);
        const follower = await User.findById(followerId);

        if (!user || !follower) {
            return NextResponse.json({ message: "User or follower not found" }, { status: 404 });
        }

        user.followers = user.followers?.filter(id => id.toString() !== followerId);
        await user.save();

        follower.following = follower.following?.filter(id => id.toString() !== userId);
        await follower.save();

        return NextResponse.json({ message: "Follower removed successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error deleting follower", error: (error as Error).message }, { status: 500 });
    }
};
