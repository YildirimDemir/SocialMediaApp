import { connectToDB } from "@/lib/mongodb"
import User, { IUser } from "@/models/userModel";
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await connectToDB();
        const users: IUser[] = await User.find();

        if(!users) {
            throw new Error("All Users Fetching Fail from MongoDB...");
        }

        return NextResponse.json(users, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'An unknown error occurred.' }, { status: 500 });
    }
}