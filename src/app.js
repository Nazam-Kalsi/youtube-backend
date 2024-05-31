import express from "express";
import {limit} from "./constants.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(cors({
    origin:process.env.REDIRECT
}));
app.use(express.json({
    limit:limit,
}));
app.use(express.urlencoded({ 
    extended: true,
    limit:limit
 }));
 app.use(express.static("public"));
 app.use(cookieParser());



 // importing Routes
 import userRouter from './routes/user.routes.js';
 app.use('/api/v1/users', userRouter);

import videoRouter from './routes/video.routes.js';
app.use('/api/v1/videos', videoRouter);

export { app };
