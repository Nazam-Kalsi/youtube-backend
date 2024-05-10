import { Router } from "express";
import { userLogout, userLogin, userRegistration, regenerationOfTokens } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleWare.js";
const router = Router();

router.route("/registration").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    userRegistration
);

router.route("/login").post(userLogin);


//secure routes
router.route("/logout").post(verifyToken,userLogout);
router.route("/regenerationOfTokens").post(regenerationOfTokens);
export default router;
