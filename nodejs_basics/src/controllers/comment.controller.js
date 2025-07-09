import {asyncHandler} from "../utils/asyncHandler.js";



const getVideoComments = asyncHandler(async (req, res) => {

});


const addComment = asyncHandler (async (req, res) => {
    // TODO: add a comment to a video
});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

});

export {
    addComment,
    updateComment,
    deleteComment,
    getVideoComments
}
