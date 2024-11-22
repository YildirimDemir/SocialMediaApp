import { NextResponse } from 'next/server';
import User, { IUser } from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';

export const GET = async (req: Request, { params }: { params: { userId: string } }) => {
    try {
        await connectToDB();
        
        const user: IUser | null = await User.findById(params.userId).populate('following', 'username profilePhoto');
        
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.following, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching following", error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
};
