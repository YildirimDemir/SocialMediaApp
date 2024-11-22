import { NextResponse } from 'next/server';
import Message from '@/models/messageModel';
import Chat from '@/models/chatModel';
import { getServerSession } from 'next-auth';
import User from '@/models/userModel';

// Belirli bir mesajı sil
export const DELETE = async (req: Request, { params }: { params: { chatId: string; messageId: string } }) => {
  const session = await getServerSession(); // Oturum kontrolü

  // Session kontrolü ve kullanıcı doğrulaması (email üzerinden)
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: 'You are not allowed!' }, { status: 401 });
  }

  const userEmail = session.user.email;  // Session'dan email al
  const { chatId, messageId } = params;

  try {
    // Kullanıcıyı email üzerinden bul
    const user = await User.findOne({ email: userEmail }).exec();
    if (!user) {
      return NextResponse.json({ message: 'User not found!' }, { status: 404 });
    }

    // Mesajı bul ve gönderenin oturum sahibi kullanıcı olduğundan emin ol
    const message = await Message.findOne({ _id: messageId, chat: chatId, sender: user._id });

    if (!message) {
      return NextResponse.json({ message: 'Message not found or you do not have permission to delete it!' }, { status: 404 });
    }

    // Mesajı sil
    await message.deleteOne();

    // Chat'i güncelle (silinen mesaj sonrası son mesaj gibi detayları güncelleyebilirsin)
    await Chat.findByIdAndUpdate(chatId, { $pull: { messages: messageId } });

    return NextResponse.json({ message: 'Message deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('Error deleting message:', err);
    return NextResponse.json({ message: 'Failed to delete message!' }, { status: 500 });
  }
};
