import mongoose,{ isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiErr } from "../utils/apiErr.js";
import { ApiRes } from "../utils/apiRes.js";
import uploadOnCloudinary, { deleteFromCloudinary } from "../utils/cloudinary.js";
import { handler } from "../utils/handler.js";

export const uploadVideo = handler(async(req,res)=>{
    {
        // algo
        // 1. check user auth
        // 2. take Video,title,description,if(thumbnail)
        // 3. upload  video on cloudinary
        // 4. save video url in db
        // 5. return video
    }
       const {title,description} = req.body;
    //    console.log(req.files);
    
       let localVideo=req.files.video[0].path;       
       if(!localVideo){
           throw new ApiErr(400,"Video is required");
        }
        let localThumbnail="";
        if( req.files &&
        Array.isArray(req.files.thumbnail) &&
        req.files.thumbnail.length > 0){
            localThumbnail=req.files.thumbnail[0].path;
        }
        let video=await uploadOnCloudinary(localVideo);
        let thumbnail;
        if(localThumbnail.length>0){
            thumbnail=await uploadOnCloudinary(localThumbnail);
        }
        console.log(thumbnail);
        if(!video){
            throw new ApiErr(500,"Error while uploading video");
        }
        console.log(video);
    
        const newVideo=await Video.create({
            owner:req.userInfo._id,
            title,
            description,
            video:video.url,
            thumbnail:thumbnail?.url||"",
            duration:video.duration
        });
        if(!newVideo){
            throw new ApiErr(500,"Error while saving video");
        }        
        return res.status(200).json(new ApiRes(200,newVideo,'Successful'));       
})

export const updateVideoDetails=handler(async(req,res)=>{
    const {id}=req.params;
    const video=await Video.findById(id);
    if(!video){
        throw new ApiErr(400,"Error in updating video information")
    }
    const {title,description}=req.body;
    if(!(title || description)){
        throw new ApiErr(400,"Title and description are required");
    }
    let newthumbnail;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length>0){
        newthumbnail=req.files.thumbnail[0].path;
        const oldThumbnail=video.thumbnail;
        await deleteFromCloudinary(oldThumbnail.match(/upload\/([^\/]+)\.[a-zA-Z0-9]+$/));
        video.thumbnail=newthumbnail;
    }

    // if(!(req.userInfo._id==video.owner)){
    //     throw new ApiErr(400,"You are not authorized to update this video");
    // }
    video.title=title;
    video.description=description;
    await video.save({validateBeforeSave:false});
    return res.status(200).json(new ApiRes(200,video,'Successful'));
})

export const deleteVideo=handler(async(req,res)=>{
    const {id}=req.params;
    if(!isValidObjectId(id)){
        throw new ApiErr(400,"Not a valid video to delete.")
    }
    const video=await Video.findById(id);
    if(!video){
        throw new ApiErr(400,"Video not Found");
    }
    const videoURL=video.video;
    const thumbnailUrl=video.thumbnail;
    await video.deleteOne({id});
    await deleteFromCloudinary(videoURL.match(/upload\/([^\/]+)\.[a-zA-Z0-9]+$/));
    await deleteFromCloudinary(thumbnailUrl.match(/upload\/([^\/]+)\.[a-zA-Z0-9]+$/));
    return res.status(200).json(new ApiRes(200,{},'Successfully deleted'));
})

export const getSingleVideo=handler(async(req,res)=>{
    const {id}=req.params;
    if(!isValidObjectId(id)){
        throw new ApiErr(400,"Invalid video id");
    }
    const video=await Video.aggregate([
        {
            $match:{_id:new mongoose.Types.ObjectId(id)}
        }
        ,{
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            _id:1,avatar:1,fullName:1,userName:1
                        }

                    }
                ]
            }
        },{
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
    ])
    if(!video){
        throw new ApiErr(400,"Video not Found");
    }    
    return res.status(200).json(new ApiRes(200,video,'Successful fetched'));
})

export const getAllVideos=handler(async(req,res)=>{
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
        const videos=await Video.find();
        if(!videos){
            throw new ApiErr(400,"No videos found");
        }
        return res.status(200).json(new ApiRes(200,videos,'Successful'));
})
// error in findbyidandupdate()
export const togglePublishStatus=handler(async(req,res)=>{
    const {id}=req.params;
    const video=await Video.findById(id);
    // const video=await Video.findByIdAndUpdate(
    //     id,
    //     {
    //         $set:{
    //             published:!published
    //         }
    //     },{new:true})
    if(!video){
        throw new ApiErr(400,"Video not found");
    }
    video.published=!video.published;
    await video.save({validateBeforeSave:false});
    return res.status(200).json(new ApiRes(200,video,'Successful'));
})
