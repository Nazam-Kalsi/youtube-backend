import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from '../models/tweet.modal.js'
import {User} from "../models/user.model.js"
import { ApiErr } from '../utils/apiErr.js'
import { ApiRes } from '../utils/apiRes.js'
import { handler } from '../utils/handler.js'

export const addTweet=handler(async(req,res,next)=>{
    {
        // user eligiblity.
        // tweet content.
        // store in db.
        // return
    }
    try {
        const {content}=req.body;
        if(!content){
            throw new ApiErr(400,"Tweet Content is required");
        }
        const tweet=await Tweet.create({
            content,
            owner:new mongoose.Types.ObjectId(req.userInfo._id)
        });
        if(!tweet){
            throw new ApiErr(400,"Error in generating the Tweet. Try again later.");
        }
        return res.status(200).json(new ApiRes(200,tweet,"Tweet Created Successfully"));
    } catch (error) {
        throw new ApiErr(400,"Error in creating tweet : "+error.message)
    }
})

export const editTweet=handler(async(req,res,next)=>{
    const newContent=req.body;
    const tweetID=req.params;
    if(!isValidObjectId(tweetID)){
        throw new ApiErr(400,"Invalid Tweet ID");
    }
    if(newContent.trim==""|| !newContent){
        throw new ApiErr(400,"Tweet Content is required");
    }
    const tweet=await Tweet.findByIdAndUpdate({
        tweetID
    },
    {
        $set:{
            content:newContent
        }
    },
    {new:true})

    if(!tweet){
        throw new ApiErr(400,"Error in updating the Tweet. Try again later.");
    }
    return res.status(200).json(new ApiRes(200,tweet,"Update Successufully."));
    })

export const deleteTweet=handler(async(req,res,next)=>{
    const tweetID=req.params;
    if(!isValidObjectId(tweetID)){
        throw new ApiErr(400,"Invalid TweetID");
    }
    await Tweet.findOneAndDelete(tweetID);
    return res.status(200).json(new ApiRes(200,"Tweet Deleted Successfully"));
})

export const getUserTweets=handler(async(req,res,next)=>{
   const userID=req.userInfo._id;
   const {limit=10,page=1}=req.query;
   const options={limit,page};
   
    const tweet=await Tweet.aggregate([
        {$match:{owner:new mongoose.Types.ObjectId(userID)}
        },{
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[
                {
                    $project:{_id:1,username:1,avatar:1,fullName:1}
                }
            ]
        }
    },{
        $addFields:{
           $first:"$owner",
        }
    }
]);

    if(!tweet){
        throw new ApiErr(400,"Tweet Not Found");
    }
    try {
        const pagination=await Tweet.aggregatePaginate(tweet,options);
        return res.status(200).json(new ApiRes(200,pagination,"Tweet fetched successuFully."));
    } catch (error) {
        throw new ApiErr(400,"error while pagination of Tweets.Try again later.")
    }
})



