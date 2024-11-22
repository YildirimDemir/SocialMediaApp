import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IStory extends Document {
    text?: string; 
    image?: string; 
    user: Types.ObjectId; 
    createdAt: Date; 
}

const storySchema = new Schema<IStory>({
    text: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Story must belong to a user.']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Story: Model<IStory> = mongoose.models.Story || mongoose.model<IStory>('Story', storySchema, 'stories');

export default Story;