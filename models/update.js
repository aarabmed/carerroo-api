const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const updateSchema = new Schema({
    verison:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    appUrl:{
        type:String,
    },
}) 

module.exports=mongoose.model('Version',updateSchema)