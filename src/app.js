import express from "express";
import limit from "./constants";
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


export { app };
