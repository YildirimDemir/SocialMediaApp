import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/mongodb';
import Story from '@/models/storyModel';
import User from '@/models/userModel';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDB();


    const userId = new URL(req.url).searchParams.get('userId');

    const filter: any = {};
    if (userId) {
      filter.user = userId; 
    }


    const stories = await Story.find(filter)
      .populate('user', 'username profilePhoto') 
      .exec();

    return NextResponse.json({ count: stories.length, stories }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching stories:', error.message);
      return NextResponse.json({ error: 'Failed to fetch stories', details: error.message }, { status: 500 });
    } else {
      console.error('An unknown error occurred');
      return NextResponse.json({ error: 'Failed to fetch stories', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "You are not allowed!" }, { status: 401 });
    }

    const userEmail = session.user.email;

    await connectToDB();
    const user = await User.findOne({ email: userEmail }).exec();
    if (!user) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }


    const { text, image }: { text?: string, image?: string } = await req.json();


    const newStory = new Story({
      text,
      image,
      user: user._id, 
    });

    await newStory.save();


    user.stories = user.stories || [];
    user.stories.push(newStory._id as mongoose.Types.ObjectId);
    await user.save();

    return NextResponse.json({ message: "Story created successfully", story: newStory }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error creating story:', error.message);
      return NextResponse.json({ message: 'Failed to create story', details: error.message }, { status: 500 });
    } else {
      console.error('An unknown error occurred');
      return NextResponse.json({ message: 'Failed to create story', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
