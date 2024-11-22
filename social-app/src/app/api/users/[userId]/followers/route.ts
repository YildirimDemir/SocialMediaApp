import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';

export const GET = async (req: NextRequest, { params }: { params: { userId: string } }) => {
    try {
        await connectToDB();

        const user = await User.findById(params.userId).populate('followers', 'username profilePhoto');

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.followers, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error fetching followers", error: (error as Error).message }, { status: 500 });
    }
};
