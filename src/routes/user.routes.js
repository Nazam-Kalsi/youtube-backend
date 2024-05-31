import { Router } from "express";
import {
    userLogout,
    userLogin,
    userRegistration,
    updateInfo,
    updateAvatar,
    updateCover,
    regenerationOfTokens,
    getUserDetails,
    getWatchHistory,
    passwordChange,
    getCurrentUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleWare.js";
const router = Router();

router.route("/registration").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    userRegistration
);

router.route("/login").post(userLogin);

//secure routes
router.route("/logout").post(verifyToken, userLogout);
router.route("/regenerationOfTokens").post(regenerationOfTokens);
router.route("/changePassword").post(verifyToken, passwordChange);
router.route("/user").get(verifyToken, getCurrentUser);
router.route("/Detail-Update").patch(verifyToken, updateInfo); //patch to update only giver data not the whole of data.
router
    .route("/Avatar-Updation")
    .patch(verifyToken, upload.single("avatar"), updateAvatar);
router
    .route("/coverImage-Updation")
    .patch(verifyToken, upload.single("coverImage"), updateCover);

router.route("/c/:user").get(verifyToken, getUserDetails); //use '/c' as we use params for data.
router.route("/watch-history").get(verifyToken, getWatchHistory);

export default router;
