import { handler } from "../utils/handler.js";
import { ApiErr } from "../utils/apiErr.js";
import { user } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiRes } from "../utils/apiRes.js";

const genetateTokens = async (userId) => {
    try {
        const info = await user.findById(userId);
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
    const existingUser = await user.findOne({
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
    const UploadCoverImageOnCloudinary =
        await uploadOnCloudinary(coverImagelocalPath);

    if (!uploadAvatarOnCloudinary)
        throw new ApiErr(400, "error in uploading avatar try again");

    //create object and enter data into database.
    const newUser = await user.create({
        fullName,
        avatar: uploadAvatarOnCloudinary.url,
        coverImage: UploadCoverImageOnCloudinary.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    });
    //check user is created or not.
    const userInfo = await user
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
    let info = await user.findOne({
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
    info=await user.findById(info._id).select("-password -refreshToken");

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
    await user.findByIdAndUpdate(
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

