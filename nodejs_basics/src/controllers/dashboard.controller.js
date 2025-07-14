import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResonse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id;

    // Total videos
    const totalVideos = await Video.countDocuments({owner: userId});

    // Total views
    const viewsAgg = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null, totalViews: { $sum: "$views" }
            }
        }
    ]);

    const totalViews = viewsAgg[0]?.totalViews || 0;

    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    // Total likes on user's videos
    const totalLikes = await Like.countDocuments({
        video: {
            $in: await Video.find({owner: userId}).distinct('_id')
        }
    });

    const stats = {
        totalVideos,
        totalViews,
        totalSubscribers,
        totalLikes
    };

    res.status(200).json(new ApiResponse(200, stats, "Channel statistics fetched successfully."));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all the videos uploaded by the channel
    const videos = await Video.find({
        owner: req.user._id,
        isPublished: true
    });

    if (!videos)
        throw new ApiError(404, "No videos found for your channel");

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

export {
    getChannelStats,
    getChannelVideos
}
