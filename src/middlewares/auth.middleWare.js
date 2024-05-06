import jwt from "jsonwebtoken";
import { ApiErr } from "../utils/apiErr.js";
import { handler } from "../utils/handler.js";
import { user } from "../models/user.model.js";


export const verifyToken=handler(async(req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){throw new ApiErr(400,"invalid token1")}
        const decordedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        console.log("token :",decordedToken);
        const info=await user.findById(decordedToken._id).select("-password -refreshToken");
        if(!info){throw new ApiErr(400,"invalid token2")}
        req.userInfo = info;
        next();
    } catch (error) {
        throw new ApiErr(401,error?.message ||"wrong tokens");
    }})