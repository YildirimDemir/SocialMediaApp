import { NextResponse } from 'next/server';
import User, { IUser } from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';

export const PATCH = async (req: Request, { params }: { params: { userId: string } }) => {
    const { userId } = params;
    const { username, name, email, profilePhoto, bio } = await req.json(); 

    if (!userId) {
        return NextResponse.json({ message: "User ID not provided." }, { status: 400 });
    }

    if (!username || !name || !email) {
        return NextResponse.json({ message: "Username, name, and email are required." }, { status: 400 });
    }

    await connectToDB();

    try {
        const updatedUser: IUser | null = await User.findByIdAndUpdate(
            userId,
            { username, name, email, profilePhoto, bio }, 
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User update failed." }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error('Error updating user info:', error);
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
};
