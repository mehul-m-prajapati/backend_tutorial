import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResonse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "views",
        sortType = "asc",
        userId
    } = req.query;

    // Example:
    //  GET /api/videos?query=funny&page=2&limit=5&sortBy=views&sortType=desc&userId=abcd1234

    // get all videos based on query, sort, pagination

    // 1. Build the match stage
    const match = {
        isPublished: true,
    };

    if (query) {
        match.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        match.owner = userId;
    }

    // 2. Build the aggregation pipeline
    const pipeline = [
        //Filters based on search + userId + isPublished.
        {
            $match: match
        },
        //Sorts documents by the chosen field (views, createdAt, etc.) and direction
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        },
        // Performs a join: looks up the user info from the users collection and
        // adds it to each video document as an array called owner.
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        // Flattens the owner array into a single object
        {
            $unwind: {
                path: "$owner",
                preserveNullAndEmptyArrays: true //if a video has no matching user, it is still included.
            }
        }
    ];

    // 3. Paginate using the plugin
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    };

    const result = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    res.status(200).json(new ApiResponse(200, result, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description, duration } = req.body

    // get video, upload to cloudinary, create video
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    if (!videoFileLocalPath)
        throw new ApiError(400, "videoFile is required");

    /*
    let thumbnailLocalPath;
    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0)
        thumbnailLocalPath = req.files.thumbnail[0].path;
    */

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    if (!videoFile)
        throw new ApiError(400, "Uploading to cloudinary failed: videoFile is required");

    const video = await Video.create({
        videoFile: videoFile.url,
        title: title,
        description: description,
        owner: req.user._id,
        duration: duration,
    });

    if (!video)
        throw new ApiError(500, "Something went wrong while creating the video entry in db");

    return res.status(201).json(new ApiResponse(200, video, "Video registered successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // get video by id
    const video = await Video.findById(videoId);

    if (!video)
        throw new ApiError(401, "Cannot find a video with given id");

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const {title, description} = req.body;

    //update video details like title, description, thumbnail
    const video = await Video.findByIdAndUpdate(videoId,
        {
            title,
            description
        },
        {
            new: true
        }
    );

    if (!video)
        throw new ApiError(404, "Cannot find a video with given id");

    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params

    // delete video
    const video = await Video.findByIdAndDelete(videoId);

    if (!video)
        throw new ApiError(404, "Cannot find a video with given id");

    return res.status(200).json(new ApiResponse(200, "", "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video)
        throw new ApiError(404, "Cannot find a video with given id");

    // Toggle the boolean
    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Video publish status toggled successfully"));
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
