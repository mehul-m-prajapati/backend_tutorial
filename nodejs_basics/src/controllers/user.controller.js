import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResonse.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, error);
    }
}

const loginUser = asyncHandler ( async (req, res) => {
    // parse body and get email, username, passwd
    // verify them against db entries
    // if match then send access/refresh tokens in cookies

    const {email, userName, password} = req.body;

    if (!email && !userName)
        throw new ApiError(400, "Please provide email or username");

    const user = await User.findOne({
        $or: [{userName, email}]
    });

    if (!user)
        throw new ApiError(404, "No user found. Please enter correct email or username");

    const isPasswdValid = await user.isPasswordCorrect(password);

    if (!isPasswdValid)
        throw new ApiError(401, "Incorrect Password. Please try again");

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // cookies can only be modified by server and not from frontend
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken
                    },
                    "User logged In Successfully"
                )
        );
})

const logOutUser = asyncHandler ( async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $unset: {refreshToken: 1}// this removes the field from document
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, "User logged Out"))

})

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
    console.log("Incoming register: email: ", email);

    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existingUser)
        throw new ApiError(409, "User with email or username already exists");

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


export {
    registerUser,
    loginUser,
    logOutUser,
}
