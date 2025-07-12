import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResonse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description, videos} = req.body;
    //create playlist

    const playlist = await Playlist.create({
        name,
        description,
        videos: videos || [],
        owner: req.user._id,
    });

    if (!playlist)
        throw new ApiError(500, "Something went wrong while creating Playlist in db");

    return res.status(201).json(new ApiResponse(200, playlist, "Playlist created successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    //get user playlists

    const userPlaylists = await Playlist.find({
        owner: userId
    });

    if (!userPlaylists)
        throw new ApiError(404, "Cannot find UserPlaylists with given userId");

    return res.status(200).json(new ApiResponse(200, userPlaylists, "User Playlist fetched successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    //get playlist by id
    const playlist = await Playlist.findOne({
        _id: playlistId
    });

    if (!playlist)
        throw new ApiError(404, "Cannot find playlist with given id");

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist)
        throw new ApiError(404, "Cannot find playlist with given id");

    // Optionally, avoid duplicates
    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId);
    }

    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Added video to playlist successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // remove video from playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist)
        throw new ApiError(404, "Cannot find playlist with given id");

    // check existence
    if (!playlist.videos.includes(videoId))
        throw new ApiError(404, "Video not found in playlist");

    // Remove the video
    playlist.videos = playlist.videos.filter(
        video => video.toString() !== videoId
    );

    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Removed video to playlist successfully"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // delete playlist

    const playlist = await Playlist.findById(playlistId);

    if (!playlist)
        throw new ApiError(404, "Cannot find playlist with given id");

    await playlist.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //update playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist)
        throw new ApiError(404, "Cannot find playlist with given id");

    playlist.name = name;
    playlist.description = description;

    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
