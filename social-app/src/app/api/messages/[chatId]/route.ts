import { NextResponse } from 'next/server';
import Message from '../../../../models/messageModel';
import Chat from '../../../../models/chatModel';
import { getServerSession } from 'next-auth';
import User from '@/models/userModel';
import { Types } from 'mongoose';

export const GET = async (req: Request, { params }: { params: { chatId: string } }) => {
  const session = await getServerSession();


  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: 'You are not allowed!' }, { status: 401 });
  }

  const userEmail = session.user.email; 
  const { chatId } = params; 

  try {
 
    const user = await User.findOne({ email: userEmail }).exec();
    if (!user) {
      return NextResponse.json({ message: 'User not found!' }, { status: 404 });
    }


    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [user._id] }, 
    });

    if (!chat) {
      return NextResponse.json({ message: 'Chat not found!' }, { status: 404 });
    }


    const messages = await Message.find({ chat: chatId })
      .sort({ sentAt: 1 })
      .populate('sender', 'username profilePhoto'); 

    return NextResponse.json(messages, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Failed to retrieve messages!' }, { status: 500 });
  }
};

export const POST = async (req: Request, { params }: { params: { chatId: string } }) => {
  const session = await getServerSession();


  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: 'You are not allowed!' }, { status: 401 });
  }

  const userEmail = session.user.email; 
  const { chatId } = params; 
  const { text, image } = await req.json(); 

  try {

    const user = await User.findOne({ email: userEmail }).exec();
    if (!user) {
      return NextResponse.json({ message: 'User not found!' }, { status: 404 });
    }

    // Chat'yi bul
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $in: [user._id] },
    });

    if (!chat) {
      return NextResponse.json({ message: 'Chat not found!' }, { status: 404 });
    }

    // Yeni mesajı oluştur
    const message = await Message.create({
      sender: user._id, 
      text,
      chat: chatId,
      sentAt: Date.now(),
      image, 
    });

   
    chat.messages.push(new Types.ObjectId(message._id)); 
    await chat.save();

    // Chat güncelleme işlemi
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: text,
      seenBy: [user._id],
    });

    return NextResponse.json(message, { status: 200 }); 
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Failed to add message!' }, { status: 500 });
  }
};
