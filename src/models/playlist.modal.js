import { Schema, model } from "mongoose";

const playlistSchema = new Schema({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId,ref: "User",required: true },
    description: { type: String,default:"My Playlist"},
    video: [{ type: Schema.Types.ObjectId, ref: "Video", required: true }],
},{timestamps:true});

export const Playlist = model("Playlist", playlistSchema);
