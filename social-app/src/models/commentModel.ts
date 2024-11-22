import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IComment extends Document {
    // _id: string;
    text: string;
    user: Types.ObjectId; 
    post: Types.ObjectId; 
    createdAt: Date; 
}

const commentSchema = new Schema<IComment>({
    text: {
        type: String,
        required: [true, 'A comment cannot be empty!'],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Comment must belong to a user.']
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Comment must belong to a post.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema, 'comments');

export default Comment;