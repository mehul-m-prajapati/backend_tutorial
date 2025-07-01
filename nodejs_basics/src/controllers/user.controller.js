import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResonse.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const registerUser = asyncHandler ( async (req, res) => {

    // get user details like email,passwd from frontend
    // validation - not empty
    // check if user already exist: username, email
    // check for images and avatar
    // upload to cloudinary
    // create user object
    // remove password and refresh token from resp
    // check for user creation
    // return res or err

    const {fullName, email, userName, password} = req.body
    console.log("register: email: ", email);

    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existingUser)
        throw new ApiError(409, "User with email or username already exists");

    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath)
        throw new ApiError(400, "Avatar file is required")

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
        coverImageLocalPath = req.files.coverImage[0].path;

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar)
        throw new ApiError(400, "Uploading to cloudinary failed: Avatar file is required");

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    // This tells Mongoose to exclude the password and refreshToken fields from the result.
    // The '-' sign before the field name means “don’t include this field.”
    // Useful for security reasons, so sensitive data is not exposed in the response.
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser)
        throw new ApiError(500, "Something went wrong while registering the user")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
})


export {registerUser}
