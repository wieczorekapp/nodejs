const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    } ,
    description : {
        type : String,
        required : true
    } ,
    isRead : {
        type: Boolean,
        default : false
    } ,        
    emailPlayer : {
        type : String,
        required : true
    } ,
    emailCoach : {
        type : String,
        required : true
    } ,
    date : {
        type: Date,
        default : Date.now
    }
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;