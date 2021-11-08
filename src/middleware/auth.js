const jwt = require('jsonwebtoken')
const { findOne } = require('../models/reporters')
const Reporter = require ('../models/reporters')

const auth = async (req,res,next)=>{
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = jwt.verify(token,process.env.JWT_SECRET)
        const reporter = await Reporter.findOne({_id:decode._id,'tokens.token':token})
        if(!reporter){
            throw new Error('Please Authenicate')
        }
        req.reporter= reporter
        req.token = token
        next()
        // res.status(200).send(req.reporter)
    }
    catch(error){
res.status(401).send({error:'Please Authenicate'})
    }

}
module.exports = auth
