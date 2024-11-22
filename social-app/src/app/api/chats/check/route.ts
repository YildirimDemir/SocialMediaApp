import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Chat from '@/models/chatModel';
import { connectToDB } from '@/lib/mongodb';

export const POST = async (req: Request) => {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  try {
    const body = await req.json();
    const { participants } = body;

    console.log("Checking existing chat for participants:", participants); 

    const sortedParticipants = participants.sort(); 
    const existingChat = await Chat.findOne({
      participants: { $all: sortedParticipants, $size: sortedParticipants.length }
    });
    

    if (existingChat) {
      console.log("Found existing chat:", existingChat); 
      return NextResponse.json({ chat: existingChat }, { status: 200 });
    }

    console.log("No existing chat found."); 
    return NextResponse.json({ chat: null }, { status: 200 });
  } catch (error) {
    console.error('Error checking existing chat:', error);
    return NextResponse.json({ message: 'Failed to check chat!' }, { status: 500 });
  }
};
