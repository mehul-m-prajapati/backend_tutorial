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

    return res.status(200).json(new ApiResponse(200, userPlaylists, "Playlist fetched successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //get playlist by id
    const playlists = await Playlist.find({
        _id: playlistId
    });

    if (!playlists)
        throw new ApiError(404, "Cannot find playlists with given id");

    return res.status(200).json(new ApiResponse(200, playlists, "Playlist fetched successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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
