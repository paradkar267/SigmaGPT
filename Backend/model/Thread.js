import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MessageSchema = new mongoose.Schema({
    role:{
        type:String,
        enum : ['user', 'assistant'],
        required:true
    },
    content :{
        type:String,
        required:true
    },
    timeStamp:{
        type:Date,
        default:Date.now
    }
});

const ThreadSchema = new mongoose.Schema({
    ThreadId:{
        type:String,
        required:true,
        unique:true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
    title: {
        type: String,
        required: true,
    },
    messages:[MessageSchema],
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }

});


export default mongoose.model("Thread", ThreadSchema);
    
