import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logOutUser, registerUser, renewAccessToken, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        },
    ]),
    registerUser
);

// Send form fields from postman, no files - Use upload.none() middleware
router.route("/login").post(upload.none(), loginUser);

// secured routes

router.route("/refresh-token").post(renewAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

router.route("/logout").post(verifyJWT, logOutUser);


export default router;
