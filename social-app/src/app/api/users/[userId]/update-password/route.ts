import { NextResponse } from 'next/server';
import User, { IUser } from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';
import bcrypt from 'bcrypt';

export const PATCH = async (req: Request, { params }: { params: { userId: string } }) => {
    const { userId } = params;
    const { passwordCurrent, newPassword, passwordConfirm } = await req.json();

    if (!userId) {
        return NextResponse.json({ message: "User ID not provided." }, { status: 400 });
    }

    if (!passwordCurrent || !newPassword || !passwordConfirm) {
        return NextResponse.json({ message: "All fields are required: current password, new password, and confirmation." }, { status: 400 });
    }

    if (newPassword !== passwordConfirm) {
        return NextResponse.json({ message: "New password and confirmation do not match." }, { status: 400 });
    }

    await connectToDB();

    try {
        const user: IUser | null = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(passwordCurrent, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Current password is incorrect." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({
            message: "Password updated successfully.",
            email: user.email,
            password: newPassword, 
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ message: "Internal server error." }, { status: 500 });
    }
};
