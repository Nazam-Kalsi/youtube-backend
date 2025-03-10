import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary=async (localPath)=>{
  try {
    if(!localPath) return null; 
     const file= await cloudinary.uploader.upload(localPath,{
      resource_type: "auto",
     })
      // console.log(file);
      fs.unlinkSync(localPath);
      return file;
  } catch (error) {
    fs.unlinkSync(localPath)//remove from the server.
    return null;
  }
}
export default uploadOnCloudinary;
export const uploadVideoOnCloudinary=async (localPath)=>{
  try {
    if(!localPath) return null; 
     const file= await cloudinary.uploader.upload(localPath);
      // console.log(file);
      fs.unlinkSync(localPath);
      return file;
  } catch (error) {
    fs.unlinkSync(localPath)//remove from the server.
    return null;
  }
}


export const deleteFromCloudinary=async(publicID)=>{
  try {
    if(!publicID) return null;
    const deleted=await cloudinary.uploader.destroy(publicID);
    return;
  } catch (error) {
    return null; 
  }
}
