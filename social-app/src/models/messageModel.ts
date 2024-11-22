import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  sender: Types.ObjectId;
  text?: string;
  chat: Types.ObjectId;
  sentAt: Date;
  image?: string;
}

const messageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: false,
  },
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export default Message;
