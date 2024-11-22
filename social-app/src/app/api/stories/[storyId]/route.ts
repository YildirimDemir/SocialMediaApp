import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/userModel';
import Story from '@/models/storyModel';

export async function GET(req: NextRequest, { params }: { params: { storyId: string } }) {
  try {
    const { storyId } = params;

 
    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json({ message: "Invalid story ID" }, { status: 400 });
    }

  
    await connectToDB();


    const story = await Story.findById(storyId)
      .populate('user', 'username profilePhoto')
      .exec();

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    return NextResponse.json(story, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching story:', (error as Error).message);
    return NextResponse.json({ message: 'Failed to fetch story', details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { storyId: string } }) {
  try {
    const { storyId } = params;


    if (!mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json({ message: "Invalid story ID" }, { status: 400 });
    }


    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "You are not allowed!" }, { status: 401 });
    }

    await connectToDB();


    const user = await User.findOne({ email: session.user.email }).exec();
    if (!user) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

   
    const story = await Story.findById(storyId).exec();
    if (!story) {
      return NextResponse.json({ message: "Story not found!" }, { status: 404 });
    }


    if ((user._id).toString() !== story.user.toString()) {
      return NextResponse.json({ message: "You do not have permission to delete this story." }, { status: 403 });
    }

  
    await Story.findByIdAndDelete(storyId.toString());

   
    await User.updateOne(
      { email: session.user.email },
      { $pull: { stories: storyId } } 
    );

    return NextResponse.json({ message: "Story deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deleting story:', (error as Error).message);
    return NextResponse.json({ message: 'Failed to delete story', details: (error as Error).message }, { status: 500 });
  }
}
