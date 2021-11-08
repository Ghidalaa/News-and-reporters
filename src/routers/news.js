const express=require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const News = require('../models/news')
const multer = require('multer')

/// part (1):- 
/// Add News 
// router.post('/news',auth,async(req,res)=>{
//     const news = new News(req.body)
//     news.save().then(()=>{
//         res.status(200).send(news)
//     }).catch((error)=>{
//         res.status(400).send('Error occured'+error)
//     })
// }) 
//--------------------------------
// Add new with some limitatio:
//-------------------------------
router.post('/news',auth,async(req,res)=>{
        const news = new News({...req.body,writer:req.reporter._id})
        news.save().then(()=>{
            res.status(200).send(news)
        }).catch((error)=>{
            res.status(400).send('Error occured'+error)
        })
    }) 
/////-----Get all data in news ------------------------
router.get('/news',auth,(req,res)=>{
    News.find({writer:req.reporter._id}).then((el)=>{
        res.status(200).send(el)
    }).catch((error)=>{
        res.status(400).send(error)
    })
})
///-------Find News by ID--------------------- 
router.get('/news/:id',auth,async(req,res)=>{
    try{ const _id= req.params.id
    const _news= await News.findOne({_id,writer:req.reporter._id})
    // console.log(req.reporter._id)
        if(!_news){res.status(400).send('No ID has been found')}
        res.status(200).send(_news)
    }catch(e){res.status(400).send(e)} 
})
//////update by ID /////
router.patch('/news/:id',auth,async(req,res)=>{
    try {
    const updates = Object.keys(req.body)// ['Title','description']
        const allowedUpdates = ['title','description']
        let isValid = updates.every((update)=> allowedUpdates.includes(update))
        console.log(isValid)

        if(!isValid){
            return res.status(400).send("Can't update this field")
        }
        
    const _id = req.params.id
    const _news= await News.findOne({_id,writer:req.reporter._id})
    if(!_news){res.status(400).send('there is no news to update')}
    updates.forEach((update)=>_news[update] = req.body[update])
        await _news.save() 
    res.status(200).send(_news)
}
catch(e){
    res.status(400).send('error is'+e)
}

}
)
/////// Delete New ////// 
router.delete('/news/:id',auth,async(req,res)=>{
    try {
            
        const _id = req.params.id
        const _news= await News.findOneAndDelete({_id,writer:req.reporter._id})
        if(!_news){res.status(400).send('there is no news to delete')}
        res.status(200).send(_news)
    }
    catch(e){
        res.status(400).send(e)
    }
    
    })
/////Remove All News //
router.delete('/news',auth,(req,res)=>{
    News.remove({writer:req.reporter._id}).then((el)=>{
        res.status(200).send(el)
    }).catch((error)=>{
        res.status(400).send(error)
    })
})
//////////// post pic to news :-
// router.post('/profile/avatar',auth,upload.single('avatar'),async(req,res)=>{
//     try{
//         req.reporter.avatar =req.file.buffer
//         await req.reporter.save()
//         res.send('image Uploaded')
//     }
//     catch(e){
//         res.send('Error has occurred ' + e)

//     }
// })

const upload = multer({
    limits:{
        fileSize:2000000   //2M
    },
    fileFilter(req,file,cb){ 
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            cb(new Error('Please upload the image '))
        }
    cb(null,true)
    }
})

router.post('/news/upload/:id',auth,upload.single('avatar'),async(req,res)=>{
    try{
        const _id = req.params.id

        const news=await News.findOne({writer:req.reporter._id,_id})

        if(!news){
            throw new Error('cant upload,No News found')
        }
        req.news = news
        // console.log(req.news)
        
        req.news.avatar=req.file.buffer
        await req.news.save()
        res.send('File uploaded successfully')
    }
    catch(e){
        res.send('cant upload,No News found'+e)
    }
})


module.exports=router