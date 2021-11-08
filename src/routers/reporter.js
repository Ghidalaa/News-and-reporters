const express=require('express')
const router = new express.Router()
const Reporter = require('../models/reporters')
const auth = require('../middleware/auth')
const multer = require('multer')
/// part (1):- 
/// Add Reportes 
// router.post('/reporters',(req,res)=>{
//     const reporter = new Reporter(req.body)
//     reporter.save().then(()=>{
//         res.status(200).send(reporter)
//     }).catch((error)=>{
//         res.status(400).send('Error occured'+error)
//     })
// })

//part(1)after adding token -- post 
router.post('/reporters',async(req,res)=>{
    try{
        const reporter = new Reporter(req.body)
        await reporter.save()
        const token = await reporter.generateToken()
        res.status(200).send({reporter,token})


    }catch(e){
        res.status(400).send( e)
    }
})

//Hash for password --> by using pre save in reporters model 
///////////////////////////////////////////////////////////////////////
/// part(2) get all data :- 
//Note: Reporter.find().then().catch()

router.get('/reporters',auth,(req,res)=>{
    Reporter.find({}).then((el)=>{
        res.status(200).send(el)
    }).catch((error)=>{
        res.status(400).send(error)
    })
})

/////////////////////////////////
// part (2-B) Get Data By ID -- findByID
// Reporter.findById(_id).then().catch()

router.get('/reporters/:id',auth,(req,res)=>{
    const _id= req.params.id
    Reporter.findById(_id).then((el)=>{
        res.status(200).send(el)
    }).catch((error)=>{res.status(400).send(error)})
    
})
////////////////////////
//part (3) Delete by ID 
//Reporter.findByIdAndDelete(_id).then().catch() //.... she used (async{ try{} catch{} })
router.delete('/reporters/:id',auth,(req,res)=>{
    const _id= req.params.id
    Reporter.findByIdAndDelete(_id).then((el)=>{
        res.status(200).send(el)
    }).catch((error)=>{res.status(400).send(error)})
    
})
//////////////
// part (3-B) Delete All 

router.delete('/reporters',auth,(req,res)=>{
    Reporter.remove({}).then((el)=>{
        res.status(200).send(el)
    }).catch((error)=>{
        res.status(400).send('Error has been occured'+error)
    })
})
//////////
//part(4)update by ID :- This is the last version of update to hash password and use validation 
//note ( async{ try{} catch(e){} } )

router.patch('/reporters/:id',auth,async(req,res)=>{
    const _id = req.params.id
    
        const updates= Object.keys(req.body)
        const allowedupdates = ['name','password']
        const isValid = updates.every((el)=> allowedupdates.includes(el))
        if(!isValid){
            return res.send ("you can update in name and password only")
        }
        try {
           const reporter= await Reporter.findById(_id)
           if(!reporter){
            return res.status(400).send('No reporter is found by this ID')
        }
        updates.forEach((update)=> reporter[update] = req.body[update])
        await reporter.save() 
        res.status(200).send(reporter)
        }
        catch(e){
            res.status(400).send(e)
        }
       
    
})


//// login : we use function find by credintioal so create it in model 

router.post('/reporters/login',async (req,res)=>{
        try{
            const reporter = await Reporter.findByCredentials(req.body.email,req.body.password)
            const token =  await reporter.generateToken()
            res.status(200).send({reporter,token})
        }
        catch(e){
            res.status(400).send('Try again' + e)
        }
    })

router.get('/profile',auth,async(req,res)=>{
   try{ 
       res.status(200).send(req.reporter)}
       catch(e){
           res.status(400).send(e)
       }
})

///logout
router.delete('/logout',auth,async(req,res)=>{
    try{ //create new array carry all tokens not equal the req.token in auth
        req.reporter.tokens = req.reporter.tokens.filter((el)=>{
           
            return el.token !== req.token
        })
        await req.reporter.save()
        res.send('Logout successfuuly')
    }
    catch(e){
        res.send('Error has occurred '+ e)
    }
})
/////
//logout from all devices:
router.delete('/logoutall',auth,async(req,res)=>{
    try{ //create new array carry all tokens not equal the req.token in auth
        req.reporter.tokens = []
        
        await req.reporter.save()
        res.send('Logout from all devices successfuuly')
    }
    catch(e){
        res.send('Error has occurred '+ e)
    }
})
//////////////////// upload profilepic :- 
//// A- model :
const upload = multer({
    limits:{
        fileSize:2000000   //2M
    },
    fileFilter(req,file,cb){ 
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            cb(new Error('Please upload an image'))
        }
    cb(null,true)
    }
})
//// post pp for reporter 
router.post('/profile/avatar',auth,upload.single('avatar'),async(req,res)=>{
    try{
        req.reporter.avatar =req.file.buffer
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.send(e)

    }
})
//////delete photo: 
router.delete('/profile/avatar',auth,upload.single('avatar'),async(req,res)=>{
    try{
        req.reporter.avatar =undefined
        await req.reporter.save()
        res.send()
    }
    catch(e){
        res.send(e)

    }
})






module.exports=router