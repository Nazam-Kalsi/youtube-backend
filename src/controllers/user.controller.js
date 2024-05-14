import { handler } from "../utils/handler.js";
import { ApiErr } from "../utils/apiErr.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiRes } from "../utils/apiRes.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const genetateTokens = async (userId) => {
    try {
        const info = await User.findById(userId);
        const refreshToken =await info.generateRefreshToken();
        // console.log("token :",refreshToken);
        
        const accessToken = await info.generateAccessToken();
        // console.log("token :",accessToken);

        info.refreshToken = refreshToken;
        await info.save({ validateBeforeSave: false });
        return {refreshToken,accessToken};
    } catch (error) {
        throw new ApiErr(500, "Server side error while generating tokens");
    }
};

export const userRegistration = handler(async (req, res, next) => {
    {//algo
        //1. get user data from user.
//2. validation (not empty).
//3. already existing username or email?
//4. create a new user and save it in the database.
//5.check for image .avatar.
//6 upload to cloudinary.
//7.create user object and call noSQL db (mongo).
//8. remove password and refresh token.
//9. user sucessufully created or not.
//10. return response with status code and json format.

    }

    //get user details
    const { fullName, email, password, userName } = req.body;
    console.log(req.body);
    {// validaton
        // if(fullName===""){
        //     throw  new ApiErr('400','Full name is required');
        // }
        //simply check all one by one or use... some function.
    }

    if (
        [fullName, email, password, userName].some((field) => {
            return field?.trim() === "";
        })
    ) {
        throw new ApiErr("400", "All fields are required");
    }

    if (!email?.includes("@")) {
        throw new ApiErr("400", "Email format is incorrect");
    }
    //Existing user
    const existingUser = await User.findOne({
        $or: [{ email }, { userName }],
    });
    if (existingUser)
        throw new ApiErr(
            409,
            "user already exist with this userName or e-mail"
        );

    //image uploading and saving image url in the database
    console.log("files : ", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImagelocalPath=req.files?.coverImage[0]?.path;
    let coverImagelocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImagelocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) throw new ApiErr(400, "avatar is required");

    //cloudinary upload
    const uploadAvatarOnCloudinary = await uploadOnCloudinary(avatarLocalPath);
    const UploadCoverImageOnCloudinary="";
    if(coverImagelocalPath){
      UploadCoverImageOnCloudinary =await uploadOnCloudinary(coverImagelocalPath);
    }

    if (!uploadAvatarOnCloudinary)
        throw new ApiErr(400, "error in uploading avatar try again");

    //create object and enter data into database.
    const newUser = await User.create({
        fullName,
        avatar: uploadAvatarOnCloudinary.url,
        coverImage: UploadCoverImageOnCloudinary?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    });
    //check user is created or not.
    const userInfo = await User
        .findById(newUser._id)
        ?.select("-password -refreshToken");
    console.log(userInfo);

    if (!userInfo) throw new Error(500, "Error In Creating User");

    //sending response
    return res
        .status(201)
        .json(new ApiRes(200, userInfo, "user created successufully"));
});

export const userLogin = handler(async (req, res, next) => {
    {//algo
        //1. get user info.
        //2. validate.
        //3. check in db for existance.
        //4. verify password.
        //5. login
    }
    //get data
    console.log("body : ",req.body);
    const { userName, email, password }= req.body;

    if (!(email||userName)) {
        throw new ApiErr(400, "username or email is required!");
    }

    //finding in db 
    let info = await User.findOne({
        $or: [{ userName }, { email }],
    });
    //if present or not.
    if (!info) {
        throw new ApiErr(404, "Invalid Credentials");
    }

    //if present--verify password
    const verification = await info.checkPassword(password);
    if (!verification) {
        throw new ApiErr(401, "Password Incorrect");
    }

    //generate tokens
    const {refreshToken,accessToken}=await genetateTokens(info._id);

    // info.refreshToken=refreshToken;//updating the refresh token field.
    // console.log("before",info);
    // delete info.refreshToken;
    // delete info.password;//removing the password from response.
    // console.log(info?.password);
    //again call db (if not expensive). :-- // 
    info=await User.findById(info._id).select("-password -refreshToken");

    //options for sending cookies.
    const options={
        httpOnly:true,
        Secure:true
    }

    // final output
   return res.status(200)
    .cookie("accessToken", accessToken ,options)
    .cookie("refreshToken", refreshToken ,options)
    .json(new ApiRes(
        201,
        {
            info,
            accessToken,
            refreshToken
        },
        "User LoggedIn Successfully!"
    ));
});

export const userLogout=handler(async(req,res,next)=>{
    await User.findByIdAndUpdate(
        req.userInfo._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {new:true}
    )
    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiRes(201,{},"user LOGOUT successufully"))


})

export const regenerationOfTokens=handler(async(req,res,next)=>{
    const cookieToken=req.cookie?.refreshToken || req.body.refreshToken;
    if(!cookieToken){
        throw new ApiErr(403,"No Authorization found in the request");
    };
    const decoded=jwt.verify(cookieToken,process.env.REFRESH_TOKEN_SECRET);
    const info=await User.findById(decoded._id).select("-password");
    if(!info){
        throw new ApiErr(403,"No Authorization found in the request");
    };
    if(cookieToken!==info?.refreshToken){
        throw new ApiErr(403,"No Authorization found in the request");
    }
    const {accessToken,refreshToken}=genetateTokens(info._id);
    const options={
        httpOnly:true,
        secure:true
    };
    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiRes(
            200,
            {accessToken,refreshToken},
            "token Regenerated Successfully"
        )
    )
})

export const passwordChange=handler(async(req,res,next)=>{
    let {oldPassword,newPassword}=req.body;
    const info=await User.findById(req.userInfo._id);
    const correctness=User.checkPassword(oldPassword);
    if(!correctness){
        throw new ApiErr(401,"Worng password!");
    }
    info.password=newPassword;
    await info.save({validateBeforeSave:false});

    return res.status(200)
    .json(new ApiRes(200,{},"Password changed succcessfully."))

})

export const currentUser=handler(async(req,res,next)=>{
    const info=  req.userInfo;
    return req.status(200)
    .json(new ApiRes(200,{currentUser:info},"User Fetched Succefully"));
})

export const updateInfo=handler(async(req,res,next)=>{
    const {fullName,email}=req.body;

    if(!fullName || !email){
        throw new ApiErr(400,"Data must be provided");
    }
    const info=await User.findByIdAndUpdate(
        req.userInfo._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select("-password")
    return res.status(200)
    .json(200,info,"Info Updated Successfully");
})
// TODO: delete old image
export const updateAvatar=handler(async(req,res,next)=>{
    const avatarLocalPath=req.file?.path;
    console.log(req.files);
    if(!avatarLocalPath){
        throw new ApiErr(400,"Avatar is required!");
    }
    const avatarPath=await uploadOnCloudinary(avatarLocalPath);
    if(!avatarPath.url){
        throw new ApiErr(500,"Server side error. Try again after some time.");
    }
    const info=await User.findByIdAndUpdate(
        req.userInfo._id,
        {
            $set:{
                avatar:avatarPath.url,
            }
        },
        {new:true}
    )

    res.status(200)
    .json(new ApiRes(200,info,"Successfully updated"));
})

export const updateCover=handler(async(req,res,next)=>{
    const coverLocalPath=req.file?.path;
    console.log(req.files);
    if(!coverLocalPath){
        throw new ApiErr(400,"Avatar is required!");
    }
    const coverPath=await uploadOnCloudinary(coverLocalPath);
    if(!coverPath.url){
        throw new ApiErr(500,"Server side error. Try again after some time.");
    }
    const info=await User.findByIdAndUpdate(
        req.userInfo._id,
        {
            $set:{
                coverImage:coverPath.url,
            }
        },
        {new:true}
    )

    res.status(200)
    .json(new ApiRes(200,info,"Successfully updated"));
})

export const getUserDetails=handler(async(req,res,next)=>{
    let {user}=req.params;
    if(!user?.trim()){
        throw new ApiErr(400,"User doesn't exist")
    }
    
    const channel=await User.aggregate([
        {
            $match:{
                userName:user?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"$subscriptions",
                localField:"channel",
                foreignField:"_id",
                as:"followers"
            }
        },
        {
            $lookup:{
            from:"$subscriptions",
            localField:"subscriber",
            foreignField:"_id",
            as:"following"
           }
        },
        {
            "$addFields":{
                subscribers:{
                    $size:"$followers"
                },
                subscribed:{
                    $size:"$following"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.userInfo?._id,"$followers"]},  //! get string. may be wrong. check!
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullName:1,
                userName:1,
                subscribers:1,
                subscribed:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1
            }
        }
    ])

    if(!channel){
        throw new ApiErr(400,"No channel found");
    }

    return res.status(200)
    .json(new ApiRes(200,channel[0],"data fetched successfully"));
})

export const getWatchHistory=handler(async(req,res,next)=>{
    const loggedInUserID=req.userInfo?._id;

    const watchH=User.aggregate([
        {
            $match:{
                _id:loggedInUserID,
                // _id: new mongoose.Types.ObjectId(req.userInfi._id)
            }
        },{
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",  
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        avatar:1,username:1,fullName:1,coverImage:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]      
            }
       }        
    ])

    return res.status(200)
    .json(200,watchH[0].watchHistory,"Watch History fetched successfully");

})