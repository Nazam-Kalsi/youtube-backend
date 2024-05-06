import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
const userSchema = new Schema(
    {
        userName: {
            type: String,
            lowercase: true,
            required: [true, "Username is required."],
            unique: [true, "This Username already exists."],
            trim: true,
            index: true,
        },
        email: {
            type: String,
            lowercase: true,
            required: [true, "Username is required."],
            unique: [true, "This Username already exists."],
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, "Fullname is required."],
            trim: true,
            index: true,
        },
        avatar: {
            type: String,
            required: [true, "avatar is required."],
        },
        coverImage: {
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
     if (this.isModified("password")) {
        this.password =await bcrypt.hash(this.password, 8);
        next();
    }
});
userSchema.methods.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function (){ //bearer token : who have this token get data.
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            userName:this.userName,
            fullName:this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:process.env.ACCESS_TOKEN_EXP,
        }
    )
}

userSchema.methods.generateRefreshToken = async function (){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expiresIn:process.env.REFRESH_TOKEN_EXP,
        }
       
    )
}


export const user = model("user", userSchema);
