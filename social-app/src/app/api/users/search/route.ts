import { connectToDB } from "@/lib/mongodb";
import User, { IUser } from "@/models/userModel";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.trim() || '';

    try {
        await connectToDB();

        const users: IUser[] = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } }     
            ]
        });

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
};
