import { ApiErr } from "../utils/apiErr.js";
import { ApiRes } from "../utils/apiRes.js";
import mongoose, { isValidObjectId } from "mongoose";
import { handler } from "../utils/handler.js";
import { Comment } from "../models/comment.modal.js";
import { User } from "../models/user.model.js";

export const createComment = handler(async (req, res, next) => {
    try {
        const commentContent = req.body;
        if (!commentContent || commentContent.trim == "") {
            throw new ApiErr(
                400,
                "Cannot post empty comment.Content is required."
            );
        }
        const { videoId } = req.params;
        if (!isValidObjectId(videoId)) {
            throw new ApiErr(
                400,
                "Video not found,so not able to comment right now."
            );
        }
        const user = req.userInfo._id;
        if (!user) {
            throw new ApiErr(400, "Log-in to post comment.");
        }

        const comment = await Comment.create({
            owner: user,
            video: videoId,
            comment: commentContent,
        });
        if (!comment) {
            throw new ApiErr(400, "Cannot post comment right now.");
        }
        return res
            .status(200)
            .json(new ApiRes(200, comment, "Comment posted succesufully."));
    } catch (error) {
        throw new ApiErr(400, "Error while creating comment" + error.message);
    }
});

export const editComment = handler(async (req, res, next) => {
    try {
        const { commentID } = req.params;
        const newContent = req.body;
        if (!newContent || newContent.trim == "") {
            throw new ApiErr(
                400,
                "Cannot post empty comment.Content is required."
            );
        }
        const comment = await Comment.findByIdAndUpdate(
            {
                commentID,
            },
            {
                $set: {
                    comment: newContent,
                },
            },
            { new: true }
        );
        if (!comment) {
            throw new ApiErr(400, "Cannot post comment.Try again later");
        }
        res.status(200).json(
            new ApiRes(200, comment, "Comment updated succesufully.")
        );
    } catch (error) {
        throw new ApiErr(400, "Error in editing the comment.");
    }
});

export const deleteComment = handler(async (req, res, next) => {
    const commentId = req.body;
    if (!isValidObjectId(commentId)) {
        throw new ApiErr(400, "Invalid comment to delete.");
    }
    try {
        await Comment.findByIdAndDelete(commentId);
        res.status(200).json(200, {}, "Deleted Succesufully.");
    } catch (err) {
        throw new ApiErr(
            400,
            "error occur while deleting comment" + err.message
        );
    }
});

export const getComments = handler(async (req, res, next) => {
    const { videoId } = req.params;
    try {
        const { page = 1, limit = 10 } = req.query;
        const options = {
            page,
            limit,
        };
        const comments = await Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId),
                },
            },
            {
                $lookup: {
                    form: "User",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                fullName: 1,
                                userName: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
                $lookup: {
                    from: "Video",
                    localField: "video",
                    foreignField: "_id",
                    as: "video",
                    pipeline: [
                        {
                            $project: { _id: 1, title: 1, thumbnail: 1 },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    owner: { $arrayElemAt: ["$owner", 0] },
                    video: { $first: "$video" },
                },
            },
        ]);
        if (!comments) {
            throw new ApiErr(404,"No comments found or error in finding the comments.");
        }
        const pagination = await Comment.aggregatePaginate(comments, options);
        if (!pagination) {
            throw ApiErr(400,"error occur in getting comments while paginaiton.");
        }

        res.status(200).json(new ApiRes(200, pagination, "Comments fetched successfully."));
    } catch (err) {
        throw new ApiErr(400, "Error in getting comments" + err.message);
    }
});
