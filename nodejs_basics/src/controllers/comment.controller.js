import {asyncHandler} from "../utils/asyncHandler.js";
import {Comment} from "../models/comment.model.js";
import {ApiResponse} from "../utils/apiResonse.js"
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",    // comment.owner
                foreignField: "_id",    // user._id
                as: "owner"
            }
        },
        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true
            }
        }
    ]);

    if (!comments)
        throw new ApiError(404, "Cannot find a comments for given video id");

    return res.status(200).json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler (async (req, res) => {
    // add a comment to a video
    const {content} = req.body;
    const { videoId } = req.params;

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: req.user._id,
    })

    if (!comment)
        throw new ApiError(500, "Something went wrong while creating the comment entry in db");

    return res.status(201).json(new ApiResponse(200, comment, "Comment registered successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    // update a comment
    const { commentId } = req.params;
    const {content} = req.body;

    const comment = await Comment.findByIdAndUpdate(commentId, {
            content,
        },
        {
            new: true
        }
    );

    if (!comment)
        throw new ApiError(404, "Cannot find a comment with given id");

    return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    // delete a comment
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment)
        throw new ApiError(404, "Cannot find a comment with given id");

    return res.status(200).json(new ApiResponse(200, "", "Comment deleted successfully"));
});

export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
}
