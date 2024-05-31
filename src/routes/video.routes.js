import { Router } from "express";
import { uploadVideo,togglePublishStatus,getAllVideos,getSingleVideo,updateVideoDetails,deleteVideo } from "../controllers/video.controller.js";
import { verifyToken } from "../middlewares/auth.middleWare.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route('/upload').post(
    upload.fields([
        {name:"video",maxCount:1},
        {name:"thumbnail",maxCount:1}
    ]),
    verifyToken,
    uploadVideo);

    router.route('/updateVideoDetails/:id').patch(upload.single("thumbnail"), verifyToken,updateVideoDetails);
    router.route('/deleteVideo/:id').post(verifyToken,deleteVideo);
    router.route('/getVideo/:id').get(getSingleVideo);
    router.route('/getVideos').get(getAllVideos);
    router.route('/togglePublish/:id').patch(verifyToken,togglePublishStatus);
export default router;