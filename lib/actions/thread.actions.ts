"use server"
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "./mongoose";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
    try {
        connectToDB()
        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        })

        // update userMOdel

        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        })

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Error creating thread:${error.message}`)
    }

}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize

        //Fetch the posts that have no parents (top-level threads)...
        const postQuery = Thread.find({ parentId: { $in: [null, undefined] } })
            .sort({ createdAt: 'desc' })
            .skip(skipAmount)
            .limit(pageSize)
            .populate({ path: 'author', model: User })
            .populate({
                path: 'children',
                populate: {
                    path: 'author',
                    model: 'User',
                    select: '_id name parentId image'
                }
            })

        const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } })

        const posts = await postQuery.exec();

        const isNext = totalPostsCount > skipAmount + posts.length;

        return { posts, isNext }

    } catch (error: any) {
        throw new Error(`Failed to fetch post:${error.message}`)
    }
}
export async function fetchThreadById(id: string) {
    try {
        connectToDB();
        // TODO populate community
        const thread = await Thread.findById(id)
            .populate(
                {
                    path: 'author',
                    model: User,
                    select: "_id name parentId image"
                },

            )
            .populate(
                {
                    path: 'children',
                    populate: [
                        {
                            path: 'author',
                            model: User,
                            select: "_id name parentId image"
                        },
                        {
                            path: 'children',
                            model: Thread,
                            populate: {
                                path: 'author',
                                model: "User",
                                select: "_id name parentId image"
                            }
                        }
                    ]
                }
            )
            .exec();

        return thread;

    } catch (error: any) {
        throw new Error(`Failed to fetch thread:${error.message}`)
    }
}

export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string,
    path: string
) {
    try {
        connectToDB();
        const originalThread = await Thread.findById(threadId);
        if (!originalThread) {
            throw new Error(`thread not found`)
        }
        // Create a  new thread

        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId
        })
        // saving
        const savedCommentThread = await commentThread.save();

        // originalThread update
        originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();
        revalidatePath(path)

    } catch (error: any) {
        throw new Error(`Error adding comment:${error.message}`)
    }
}