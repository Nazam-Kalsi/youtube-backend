import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jwt";
const userSchema = new Schema(
    {
        username: {
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
        fullname: {
            type: String,
            required: [true, "Username is required."],
            trim: true,
            index: true,
        },
        avatar: {
            type: String,
            required: [true, "Username is required."],
        },
        coverimage: {
            type: String,
        },
        watchhistory: [
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
        this.password = bcrypt.hash(this.password, 8);
        next();
    }
});
userSchema.methods.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.checkAccessToken = async function (){ //bearer token : who have this token get data.
    jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname,
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expireIn:REFRESH_TOKEN_EXP,
        }
    )
}

userSchema.methods.checkRefreshToken = async function (){
    jwt.sign(
        {
            _id:this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expireIn:ACCESS_TOKEN_EXP,
        }
    )
}


export const user = model("user", userSchema);
