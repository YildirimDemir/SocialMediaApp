import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import Comment from './commentModel';

export interface IPost extends Document {
    // _id: string;
    content: string;
    image: string;
    author: Types.ObjectId;
    comments: Types.ObjectId[];
    likes: Types.ObjectId[];
    category: string;
    createdAt: Date;
}

const postSchema = new Schema<IPost>({
    content: {
        type: String,
        required: [true, 'A post content is required'],
    },
    image: {
        type: String,
        required: [true, 'A post image is required'],
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'An author is required'],
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    likes: [{ 
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    category: {
        type: String,
        enum: ['Sport', 'Game', 'News', 'Technology', 'Health', 'Education', 'Entertainment', 'Business', 'Politics', 'Travel'],
        required: [true, 'A category is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

postSchema.pre('findOneAndDelete', async function (next) {
    const postId = this.getQuery()._id;

    await Comment.deleteMany({ post: postId });

    next();
});

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;