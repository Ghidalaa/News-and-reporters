const express = require('express');
const app = express();
const cors = require('cors');
const newsRouter = require('./routers/news')
reporterRouter = require('./routers/reporter')
require('dotenv').config()
const port = process.env.port 
app.use (express.json())
require('./db/mongoose')
app.use(cors())

app.use(reporterRouter);
app.use(newsRouter)





app.listen(port ,()=>{
    console.log('server is running '+ port)
})