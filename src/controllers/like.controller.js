import { ApiErr } from "../utils/apiErr";
import { ApiRes } from "../utils/apiRes";
import mongoose,{isValidObjectId} from "mongoose";
import {Like} from '../models/like.modal.js' 
import {Comment} from '../models/comment.modal.js'
import {User} from '../models/user.modal.js'
import {Video} from '../models/video.model.js'
import { handler } from "../utils/handler.js";

export const toggleLikeVideo=handler(async(req,res,next)=>{
    const {videoId}=req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiErr(400,"Invalid video id");
    }
    const user=req.userInfo._id;
    if(!isValidObjectId(user)){
        throw new ApiErr(400,"need to log-in before liking a video.");
    }
    const ifLiked=await Like.find({user:user,video:videoId});
    if(ifLiked){
        await Like.deleteOne({user:user,video:videoId});
    }else{
        const likeVideo=await Like.create({
            video:videoId,
            user:user
        })
    }
    res.status(200).json("success");
})

export const toggleLikeComment=handler(async(req,res,next)=>{
    const {commentId}=req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiErr(400,"Invalid comment id");
    }
    const user=req.userInfo._id;
    if(!isValidObjectId(user)){
        throw new ApiErr(400,"need to log-in before liking a comment.");
    }
    const ifLiked=await Like.find({user:user,comment:commentId});
    if(ifLiked){
        await Like.deleteOne({user:user,comment:commentId});
    }else{
        const likeComment=await Like.create({
            comment:commentId,
            user:user
        })
    }
    res.status(200).json("success");
})

export const toggleLikeTweet=handler(async(req,res,next)=>{
    const {tweetId}=req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiErr(400,"Invalid tweet id");
    }
    const user=req.userInfo._id;
    if(!isValidObjectId(user)){
        throw new ApiErr(400,"need to log-in before liking a tweet.");
    }
    const ifLiked=await Like.find({user:user,tweet:tweetId});
    if(ifLiked){
        await Like.deleteOne({user:user,tweet:tweetId});
    }else{
        const liketweet=await Like.create({
            tweet:tweetId,
            user:user
        })
    }
    res.status(200).json("success");
})


export const likedVideo=handler(async(req,res,next)=>{
    const user=req.userInfo._id;
    const {limit=10,page=1}=req.query;
    const options={limit,page};
    const videos=await Like.aggregate([
        {
            //TODO: get only doc. that have video field.
            $match:{
                $and:[
                    {user:user},{video:{$ne:null}}
                ]
            }
        },{
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[{
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{_id:1,username:1,profilePicture:1,fullName:1}
                            }
                        ]
                    }
                },{
                    $addFields:{
                        // owner:{$arrayElemAt:["$owner",0]}
                        owner:{$first:"$owner"}
                    }
                }
                ]
            }
        },{
            $addFields:{
                video:{ $arrayElemAt: [ "$video", 0 ] }
            }
        }
    ]);
    if(!videos){
        throw new ApiErr(400,"Error in finding liked videos.");
    }
    const pagination=await Like.aggregatePaginate(videos,options);
    if(!pagination){
        throw new ApiErr(400,"error while pagination.Try again later.")
    }
    return res.status(200).json(new ApiRes(200,pagination,"Videos Successfully fetched."))
})