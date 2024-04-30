import dotenv from "dotenv";
import dbconnect from "./db/db.js";
import { app } from "./app.js";
dotenv.config();

const port = process.env.PORT ||3000;
 dbconnect()
 .then(()=>{
        app.on("error",(error)=>{
                    console.log(error);
                })
        app.listen(port, () => {
                console.log("app working...on port : " + port);
            });
 })
 .catch(err => console.log(err));














// import { db } from "./constants";
// import { Express } from "express";
// const app=express();    
// ;(async()=>{
//     try{
//         const db = await mongoose.connect(`${process.env.DB_URL}/${db}`);
        // app.on("error",(error)=>{
        //     console.log(error);
        // })
        // const port=process.env.PORT || 5000;
        // app.listen(port,()=>{
        //     console.log(`App listening on ${port}`);
        // });
//     }
//     catch(err){
//         console.log(err);
//     }
// })();