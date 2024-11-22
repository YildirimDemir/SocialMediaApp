import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import Post from './postModel';
import Comment from './commentModel';
import Chat from './chatModel';
import userIcon from '../../public/images/user-icon.jpg';
import { ref } from 'firebase/storage';
import Story from './storyModel';

export interface IUser extends Document {
    _id: string;
    id: string
    username: string;
    name: string;
    email: string;
    password: string;
    role: 'user';
    posts?: mongoose.Types.ObjectId[];
    stories?: mongoose.Types.ObjectId[];
    likes?: Types.ObjectId[];
    comments?: Types.ObjectId[];
    chats?: Types.ObjectId[];
    followers?: Types.ObjectId[];
    following?: Types.ObjectId[];
    bio: string; 
    resetToken?: string;
    resetTokenExpiry?: Date;
    profilePhoto: string;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'A username is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'A name is required'],
    },
    email: {
        type: String,
        required: [true, 'A email is required'],
        unique: true
    },
    profilePhoto: {
        type: String,
        default: userIcon.src,
    },
    bio: {
        type: String,
        default: '',
    },
    password: {
        type: String,
        required: [true, 'A password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    role: {
        type: String,
        required: true,
        default: 'user',
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    stories: [{
        type: Schema.Types.ObjectId,
        ref: 'Story'
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    }],
    chats: [{
        type: Schema.Types.ObjectId,
        ref: 'Chat',
    }],
    followers: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        default: [],
    },
    following: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        default: [],
    },
    resetToken: String,
    resetTokenExpiry: Date,
}, {
    timestamps: true,
});

userSchema.pre('findOneAndDelete', async function (next) {
    const userId = this.getQuery()._id;

    const posts = await Post.find({ author: userId });
    for (const post of posts) {
        await Comment.deleteMany({ post: post._id });
    }
    await Post.deleteMany({ author: userId });

    await Story.deleteMany({ user: userId }); 

    await Comment.deleteMany({ user: userId });

    await Chat.deleteMany({ user: userId });

    next();
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
