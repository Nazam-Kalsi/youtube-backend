export const handler=(fn)=>{
    (req,res,next)=>{
        Promise.resolve(fn(req,res,next))
        .catch((err)=>next(err)) 
    } 
}






// export const handler=(fn)=>async(err,req,res,next)=>{
// try {
//     await fn(req,res,next);
// } catch (error) {
//     res.status(error.status||500).json({
//         success:false,
//         msg:error.message,
//     })
// }
// }

