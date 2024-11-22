import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { IUser } from './userModel';

export interface IChat extends Document {
  _id: string;
  participants: (Types.ObjectId | IUser)[];
  messages: Types.ObjectId[];
  createdAt: Date;
  lastMessage?: string;  
  seenBy?: Types.ObjectId[]; 
}

const chatSchema = new Schema<IChat>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastMessage: { 
    type: String,
  },
  seenBy: [{ 
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

chatSchema.pre('findOneAndDelete', async function (next) {
  try {
    const chatId = this.getQuery()._id;
    
    await mongoose.model('Message').deleteMany({ chat: chatId });

    next();
  } catch (err: unknown) { 
    if (err instanceof Error) {
      next(err);  
    } else {
      next(new Error('Unknown error occurred')); 
    }
  }
});

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);

export default Chat;