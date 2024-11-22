import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { connectToDB } from '@/lib/mongodb';
import Comment from '@/models/commentModel';
import Post from '@/models/postModel';
import User from '@/models/userModel';

export async function GET(req: NextRequest, { params }: { params: { commentId: string } }) {
  const { commentId } = params;

  if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) {
    return NextResponse.json({ message: 'Invalid comment ID.' }, { status: 400 });
  }

  try {
    await connectToDB();

    const comment = await Comment.findById(commentId).exec();

    if (!comment) {
      return NextResponse.json({ message: 'Comment not found.' }, { status: 404 });
    }

    return NextResponse.json(comment, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching comment:', error instanceof Error ? error.message : 'An unknown error occurred');
    return NextResponse.json({ message: 'Failed to fetch comment', details: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { commentId: string } }) {
  try {
    await connectToDB();

    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "You are not allowed!" }, { status: 401 });
    }

    const comment = await Comment.findById(params.commentId).exec();
    if (!comment) {
      return NextResponse.json({ message: "Comment not found!" }, { status: 404 });
    }

    await Comment.findByIdAndDelete(params.commentId);

    const post = await Post.findOne({ comments: params.commentId }).exec();
    if (post) {
      post.comments = post.comments.filter((id: mongoose.Types.ObjectId) => id.toString() !== params.commentId);
      await post.save();
    }

    const user = await User.findOne({ comments: params.commentId }).exec();
    if (user && user.comments) {
      user.comments = user.comments.filter((id: mongoose.Types.ObjectId) => id.toString() !== params.commentId);
      await user.save();
    }

    return NextResponse.json({ message: "Comment removed successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error removing comment:', error instanceof Error ? error.message : 'An unknown error occurred');
    return NextResponse.json({ message: 'Failed to remove comment', details: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}
