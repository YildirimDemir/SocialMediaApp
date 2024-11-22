import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/userModel';
import { connectToDB } from '@/lib/mongodb';

export const GET = async (request: NextRequest, { params }: { params: { email: string } }): Promise<NextResponse> => {
    const { email } = params;

    if (!email) {
        return NextResponse.json({ message: "Email not found..." }, { status: 400 });
    }

    await connectToDB();
    const user = await User.findOne({ email });

    if (!user) {
        return NextResponse.json({ message: "User not found on Email..." }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
};
