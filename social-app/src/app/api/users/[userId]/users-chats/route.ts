import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/userModel';


export const GET = async (req: Request, { params }: { params: { userId: string } }) => {
  const { userId } = params;


  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ message: 'Invalid userId format' }, { status: 400 });
  }

  try {

    const user = await User.findById(userId).populate('chats'); 

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }


    const chats = user.chats; 

    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return NextResponse.json({ message: 'Failed to fetch user chats' }, { status: 500 });
  }
};
