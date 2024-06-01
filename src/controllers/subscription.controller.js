import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiErr } from "../utils/apiErr.js";
import { ApiRes } from "../utils/apiRes.js";
import { handler } from "../utils/handler.js";

export const getSubscribers=handler(async(req,res,next)=>{
    const {channelID}=req.params;
    if(!isValidObjectId(channelID)){
        throw new ApiErr(400,"Channel not found.");
    }
    // const subs=await Subscription.find({channel:channelID}).select("-channel");
    const subs=await Subscription.aggregate([
        {
            $match:{channel:new mongoose.Types.ObjectId(channelID)}
        },{
            $lookup:{
                forn:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber",
                pipeline:[
                    {
                        $project:{_id:1,userName:1,fullName:1,avatar:1}
                    }
                ]
            }
        },{
            $addFields:{
                subscriber:{$arrayElemAt:["$subscriber",0]}
            }
        },{
            $project:{subscriber:1,createdAt:1}
        }
    ])
    if(subs.length==0){
        throw new ApiErr(400,"There are no any subscriber to this channel.");
    }
    if(!subs){
        throw new ApiErr(400,"Error in fetching the subscribers.");
    }
    return res.status(200).json(new ApiRes(200,subs,"suscribers fetched successufully"));
})

export const userSubscribedTo=handler(async(req,res,next)=>{
    const {userID}=req.params;
    if(!isValidObjectId(userID)){
        throw new ApiErr(400,"user not found.");
    }
    // const subsTo=await Subscription.find({subscriber:userID}).select("-subscriber");
    const subsTo=await Subscription.aggregate([
        {
            $match:{subscriber:new mongoose.Types.ObjectId(userID)}
        },{
            $lookup:{
                form:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel",
                pipeline:[
                    {
                        $project:{_id:1,fullName:1,userName:1,avatar:1}
                    }
                ]
            }
        },
        {
            $addFields:{
                $channel:{
                    $first:"$channel"
                }
            }
        },{
            $project:{channel:1,createdAt:1}
        }
    ])
    if(subsTo.length==0){
        throw new ApiErr(400,"TThis channel did not subscribed to any other channel.");
    }
    if(!subsTo){
        throw new ApiErr(400,"Error in fetching the subscribed To.");
    }
    return res.status(200).json(new ApiRes(200,subsTo,"suscribed To fetched successufully"));
})

export const toggleSubscribe=handler(async(req,res,next)=>{
    const {channelID}=req.params;
    if(!isValidObjectId(channelID)){
        throw new ApiErr(400,"Channel not found");
    }
    const doc=await Subscription.find({user:req.userInfo._id,channel:channelID});
    if(doc){
        const deleted=await Subscription.deleteOne({user:req.userInfo._id,channel:channelID});
        if(!deleted){
            throw new ApiErr(400,"Error while Unsubscribing.Try again");
        }

        return res.status(200).json(new ApiRes(200,{},"Unsubscribed successufully."));
    }
    else{
        const newSub=await Subscription.create({
            user:req.userInfo._id,
            channel:channelID
        })
        if(!newSub){
            throw new ApiErr(400,"error while subscribing channel.Try again");
        }
        return res.status(200).json(new ApiRes(200,{},"Subscribed successufully."))
    }
})


