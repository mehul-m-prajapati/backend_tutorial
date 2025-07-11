import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResonse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    // build a healthcheck response that simply returns the OK status as json with a message
    const now = new Date();
    const localDateTime = now.toLocaleString();

    return res.status(200).json(new ApiResponse(200, localDateTime, "Health: OK"))
})

export {
    healthcheck
}
