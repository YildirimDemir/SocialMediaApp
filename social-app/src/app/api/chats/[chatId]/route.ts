import { NextResponse } from 'next/server';
import Chat from '../../../../models/chatModel';
import { getServerSession } from 'next-auth'; 
import User from '@/models/userModel';
import { Types } from 'mongoose';
import { connectToDB } from '@/lib/mongodb';


export const GET = async (req: Request, { params }: { params: { chatId: string } }) => {
  try {
      const { chatId } = params;

      console.log(`CHAT ID IS: ${chatId}`)

      await connectToDB();

   
      const chat = await Chat.findById(chatId)
      .populate('participants', '_id username profilePhoto');

      if (!chat) {
          return NextResponse.json({ message: 'Chat not found or you do not have permission to access it.' }, { status: 404 });
      }

      return NextResponse.json(chat, { status: 200 });
  } catch (error) {
      console.error('Error fetching chat:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return NextResponse.json({ message: `Failed to get chat: ${errorMessage}` }, { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: { params: { chatId: string } }) => {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'You are not allowed!' }, { status: 401 });
    }

    const userId = new Types.ObjectId(session.user.id);

    const { chatId } = params;
    console.log('Attempting to delete chat with ID:', chatId);


    const chat = await Chat.findOne({
      _id: new Types.ObjectId(chatId), 
    });

    if (!chat) {
      console.log('Chat not found or no permission to delete');
      return NextResponse.json({ message: 'Chat not found or you do not have permission to delete it.' }, { status: 404 });
    }


    await Chat.findByIdAndDelete(chatId);


    await User.updateMany(
      { _id: { $in: chat.participants } },
      { $pull: { chats: chatId } }
    );

    return NextResponse.json({ message: 'Chat deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ message: `Failed to delete chat: ${errorMessage}` }, { status: 500 });
  }
};

