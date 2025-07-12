import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResonse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //create tweet
    const { content } = req.body;

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });

    if (!tweet)
        throw new ApiError(500, "Something went wrong while creating tweet in db");

    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // get user tweets

    const userTweets = await Tweet.find({
        owner: req.user._id
    });

    if (!userTweets)
        throw new ApiError(404, "Cannot find tweets for the user");

    return res.status(200).json(new ApiResponse(200, userTweets, "User tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found for given id");
    }

    tweet.content = content;
    await tweet.save();

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //delete tweet
    const { tweetId } = req.params;

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found for given id");
    }

    await tweet.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
