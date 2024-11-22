import { connectToDB } from '@/lib/mongodb';
import User from '@/models/userModel';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function DELETE(req: NextRequest) {
    const userId = req.headers.get('user-id');
    const { password } = await req.json();

    if (!userId || !password) {
        return NextResponse.json({ message: 'User ID and password are required' }, { status: 400 });
    }

    await connectToDB();

    try {
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return NextResponse.json({ message: 'Incorrect password' }, { status: 401 });
        }

        await User.findByIdAndDelete(userId);

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
