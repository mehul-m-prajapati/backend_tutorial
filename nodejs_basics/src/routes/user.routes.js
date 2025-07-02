import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { loginUser, logOutUser, registerUser, renewAccessToken } from "../controllers/user.controller.js"
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


router.route("/logout").post(verifyJWT, logOutUser);


export default router;
