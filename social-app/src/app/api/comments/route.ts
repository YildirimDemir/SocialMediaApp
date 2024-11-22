import { connectToDB } from "@/lib/mongodb";
import Comment from "@/models/commentModel";
import Post from "@/models/postModel";
import User from "@/models/userModel";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "You are not allowed!" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const user = await User.findOne({ email: userEmail }).exec();
    if (!user) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    const { postId, text }: { postId: string, text: string } = await req.json();
    if (!text || text.trim() === '') {
      return NextResponse.json({ message: "A comment cannot be empty!" }, { status: 400 });
    }

    const newComment = new Comment({
      text,
      post: new mongoose.Types.ObjectId(postId),
      user: user._id,
    });

    await newComment.save();

    await User.findByIdAndUpdate(user._id, { $push: { comments: newComment._id } }, { new: true }).exec();

    const post = await Post.findById(postId).exec();
    if (!post) {
      return NextResponse.json({ message: "Post not found!" }, { status: 404 });
    }

    post.comments.push(newComment._id as mongoose.Types.ObjectId);
    await post.save();

    return NextResponse.json({ message: "Comment added successfully", comment: newComment }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error adding comment:', error instanceof Error ? error.message : 'An unknown error occurred');
    return NextResponse.json({ message: 'Failed to add comment', details: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    await connectToDB();

    const comments = await Comment.find({ post: postId }).exec(); // Düzeltildi

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching comments:', error instanceof Error ? error.message : 'An unknown error occurred');
    return NextResponse.json({ message: 'Failed to fetch comments', details: error instanceof Error ? error.message : 'An unknown error occurred' }, { status: 500 });
  }
}
