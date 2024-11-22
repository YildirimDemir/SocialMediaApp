import { NextResponse } from 'next/server';
import Chat from '../../../models/chatModel';
import { getServerSession } from 'next-auth'; 
import User from '@/models/userModel';


export const GET = async (req: Request) => {
  try {
    const session = await getServerSession(); 

   
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'You are not allowed!' }, { status: 401 });
    }

    const userEmail = session.user.email; 


    const user = await User.findOne({ email: userEmail }).exec();
    if (!user) {
      return NextResponse.json({ message: 'User not found!' }, { status: 404 });
    }

    
    const chats = await Chat.find({
      participants: user._id
    }).populate('participants', '_id username profilePhoto'); 

    return NextResponse.json(chats, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to get chats!' }, { status: 500 });
  }
};



export const POST = async (req: Request) => {
  const session = await getServerSession();

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: 'You are not allowed!' }, { status: 401 });
  }

  const userId = session.user.id; // Kullanıcı ID'sini al
  const body = await req.json();
  const { participants } = body;
  console.log("Participants before adding userId:", participants);


  const updatedParticipants = [...participants, userId].filter(Boolean).sort();
  console.log("Updated Participants after filtering:", updatedParticipants); 

  try {
    const newChat = await Chat.create({
      participants: updatedParticipants,
      messages: [],
    });


    await Promise.all(updatedParticipants.map(async (participantId: string) => {
      await User.findByIdAndUpdate(participantId, {
        $addToSet: { chats: newChat._id }  
      });
    }));

    return NextResponse.json(newChat, { status: 201 });
  } catch (error) {
    // Hata türünü kontrol et
    if (error instanceof Error) {
      console.error('Error creating chat:', error.message);
      return NextResponse.json({ message: 'Failed to add chat!', error: error.message }, { status: 500 });
    } else {
      console.error('An unknown error occurred', error);
      return NextResponse.json({ message: 'Failed to add chat!', error: 'Unknown error occurred' }, { status: 500 });
    }
  }
};