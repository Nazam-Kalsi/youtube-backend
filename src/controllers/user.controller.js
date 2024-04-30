import {handler} from '../utils/handler.js';

export const userRegistration=handler( async (req,res,next)=> {
res.status(200).json({
    message:"ok"
})
})
