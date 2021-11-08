const mongoose = require('mongoose')
const newsShema = mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String, 
        required:true,
        trim:true,
        lowercase:true
    },
    writer:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    avatar: {
        type:Buffer
    }
    
}) 

const News = mongoose.model('News',newsShema )
module.exports = News