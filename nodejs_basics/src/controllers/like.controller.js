import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResonse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    // Check if like exists
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    if (existingLike) {

        // Unlike
        await existingLike.deleteOne();

        return res.status(200).json(new ApiResponse(200, {liked: false}, "Video unliked successfully"));
    }
    else {
        const likedVideo = await Like.create({
            video: videoId,
            likedBy: req.user._id
        });

        if (!likedVideo)
            throw new ApiError(500, "Something went wrong while liking video in db");

        return res.status(201).json(new ApiResponse(200, likedVideo, "Video liked successfully"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    // Check if comment exists
    const existingComment= await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    if (existingComment) {

        // Unlike
        await existingComment.deleteOne();

        return res.status(200).json(new ApiResponse(200, {liked: false}, "Comment unliked successfully"));
    }
    else {
        const likedComment = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        });

        if (!likedComment)
            throw new ApiError(500, "Something went wrong while liking comment in db");

        return res.status(201).json(new ApiResponse(200, likedComment, "Comment liked successfully"));
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    // Check if Tweet exists
    const existingTweet = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    if (existingTweet) {

        // Unlike
        await existingTweet.deleteOne();

        return res.status(200).json(new ApiResponse(200, {liked: false}, "Tweet unliked successfully"));
    }
    else {
        const likedTweet = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        });

        if (!likedTweet)
            throw new ApiError(500, "Something went wrong while liking Tweet in db");

        return res.status(201).json(new ApiResponse(200, likedTweet, "Tweet liked successfully"));
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {

    const likedVideos = await Like.aggregate([
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',    // videos._id
                as: 'video'
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'likedBy',
                foreignField: '_id',    // users._id
                as: 'likedBy'
            }
        },
        {
            $addFields: {
                video: { $arrayElemAt: ['$video', 0] },
                likedBy: { $arrayElemAt: ['$likedBy', 0] },
            }
        }
    ]);

    if (!likedVideos)
        throw new ApiError(404, "No liked videos found in db");

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
