const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt= require('bcrypt')
const jwt = require('jsonwebtoken')
const reporterSchema= mongoose.Schema({
    name:{type:String ,
    required:true , 
trim:true,
lowercase:true}, 
phonenumber:{
    type:String,
    required:true,
    trim:true,
    validate(num){
        if(!validator.isMobilePhone(num,'ar-EG')){
            throw new Error('Phone number is invalid')
        }
}},
password:{type:String, 
        required:true,
        trim:true,
        minLength:6
},
email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Invalid Email")
        }
    }    
},
    avatar: {
        type:Buffer
    },

    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ]

})

/////// 
//1- hash password pre save fn :-
reporterSchema.pre('save',async function(next){
    const reporter = this 
    if(reporter.isModified('password')){
 reporter.password= await bcrypt.hash(reporter.password,8)
    }
    next()
})
 /// 2- find by credentional fn :-

reporterSchema.statics.findByCredentials = async(email,password) =>{
    const reporter = await Reporter.findOne({email})
    if(!reporter){
        throw new Error('Unable to login. Please check email or password')
    }

    const isMatch = await bcrypt.compare(password,reporter.password)

    if(!isMatch){
        throw new Error('Unable to login. Please check email or password')
    }

    return reporter
}///// send data to frontEnd as object not document :
//and delete password and token :
reporterSchema.methods.toJSON=function(){
    const user = this 
    const userObject = user.toObject()
    delete userObject.tokens
    delete userObject.password
    return userObject
}



//////////////////////

reporterSchema.methods.generateToken = async function () {
    const reporter= this ; 
const token = jwt.sign({_id:reporter._id.toString()},process.env.JWT_SECRET)
reporter.tokens = reporter .tokens.concat({token:token})
await reporter.save()
return token

}




const Reporter = mongoose.model('Reporter',reporterSchema )
module.exports= Reporter