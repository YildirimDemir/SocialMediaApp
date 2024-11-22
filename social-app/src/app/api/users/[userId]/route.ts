import { NextRequest, NextResponse } from 'next/server';
import User, { IUser } from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export const GET = async (req: NextRequest, { params }: { params: { userId: string } }) => {
    try {
        const { userId } = params;


        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid ID format:', userId);
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
        }

        await connectToDB();

        const user: IUser | null = await User.findById(userId).exec();

        if (!user) {
            console.error('User not found for ID:', userId);
            return NextResponse.json({ message: "User not found on ID..." }, { status: 404 });
        }

        return NextResponse.json(user, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error fetching user:', error.message);
            return NextResponse.json({ message: 'Failed to fetch user', details: error.message }, { status: 500 });
        } else {
            console.error('An unknown error occurred:', error);
            return NextResponse.json({ message: 'Failed to fetch user', details: 'An unknown error occurred' }, { status: 500 });
        }
    }
};

export const DELETE = async (req: NextRequest, { params }: { params: { userId: string } }) => {
    try {
        const { userId } = params;


        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid ID format:', userId);
            return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
        }

        await connectToDB();

        const deletedUser = await User.findByIdAndDelete(userId).exec();

        if (!deletedUser) {
            console.error('User not found for ID:', userId);
            return NextResponse.json({ message: "User not found on ID..." }, { status: 404 });
        }

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error deleting user:', error.message);
            return NextResponse.json({ message: 'Failed to delete user', details: error.message }, { status: 500 });
        } else {
            console.error('An unknown error occurred:', error);
            return NextResponse.json({ message: 'Failed to delete user', details: 'An unknown error occurred' }, { status: 500 });
        }
    }
};
