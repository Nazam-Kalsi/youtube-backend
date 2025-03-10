import mongoose,{Schema,model} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema=new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    title:{
        type:String,
        required:true,
        index:true,
    },
    description:{
        type:String,
        default:""
    },
    video:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
    },
    duration:{
        type:Number,
        required:true,
    },
    view:{
        type:Number,
        default:0,        
    },
    published:{
        type:Boolean,
        default:true,
    }
},{timestamps:true});

mongoose.plugin(mongooseAggregatePaginate);

export const Video=model("Video",videoSchema)