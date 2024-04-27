import mongoose from 'mongoose';
import {db} from '../constants.js'
// import dotenv from "dotenv";

// dotenv.config();


async function dbconnect(){
    try {
        const connection=await mongoose.connect(`${process.env.DB_URL}/${db}`);
        console.log('MongoDB Connected: ',connection.connection.host);
        
    } catch (error) {
        console.log(error);
    }
}

export default dbconnect;

