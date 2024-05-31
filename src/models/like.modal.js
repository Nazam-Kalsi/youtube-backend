import { Schema, model } from "mongoose";

const likeSchema = new Schema({
    comment: { type: Schema.Types.ObjectId, ref: "Comment"},
    video: { type: Schema.Types.ObjectId, ref: "Video"},
    tweet: { type: Schema.Types.ObjectId, ref: "Tweet"},
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
},{timestamps:true});

export const Likes = model("Like", likeSchema);

