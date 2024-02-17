const express = require('express')
const mongoose = require('mongoose')
const router = require ('./router/agentRouter')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors({origin:"*"}))
app.use(express.json())

app.use('/uploads', express.static('uploads'));
app.use('/api', router)


const port = process.env.port
const db = process.env.DB

mongoose.connect(db).then(()=>{
    console.log('database connection established')
    app.listen(port,()=>{
        console.log(`Server listening on ${port}`)
    })
}).catch((error)=>{
    console.log(`database unable to connect ${error}`)
})