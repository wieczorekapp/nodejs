const mongoose = require("mongoose");

const WorkoutSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    } , 
    description : {
        type : String,
        required : true
    } ,
    mark : {
        type: Number,
    } ,  
    result : {
        type: String,
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

const Workout = mongoose.model("Workout", WorkoutSchema);

module.exports = Workout;