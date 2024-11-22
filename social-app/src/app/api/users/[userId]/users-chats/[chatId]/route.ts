import { connectToDB } from '@/lib/mongodb';
import User from '@/models/userModel';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: { userId: string, chatId: string } }) {

  const { userId, chatId } = params;


  await connectToDB();

  try {
  
    const user = await User.findOneAndUpdate(
      { _id: userId, 'chats': chatId }, 
      { $pull: { chats: chatId } },
      { new: true }
    );

    if (!user) {

      return NextResponse.json({ message: 'User not found or chat not associated with this user' }, { status: 404 });
    }


    return NextResponse.json({ message: 'Chat removed from user successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to remove chat from user' }, { status: 500 });
  }
}
