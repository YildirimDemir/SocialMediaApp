// Update Profile Photo
import { NextResponse } from 'next/server';
import User, { IUser } from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';

export const PATCH = async (req: Request, { params }: { params: { userId: string } }) => {
    const { userId } = params;
    const { profilePhoto } = await req.json(); 

    if (!userId) {
        return NextResponse.json({ message: "User ID not provided." }, { status: 400 });
    }

    if (!profilePhoto) {
        return NextResponse.json({ message: "Profile Photo is required." }, { status: 400 });
    }

    await connectToDB();

    try {
        const updatedUser: IUser | null = await User.findByIdAndUpdate(
            userId,
            { profilePhoto }, 
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
