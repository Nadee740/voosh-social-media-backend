require('dotenv').config();
require('./db/mongoose')
const express=require('express')

require('./passportConfig')

const cors = require('cors');
const passport=require('passport');
const session=require('express-session');
const app=express()
const port=8000

app.use(cors())
app.use(express.json())

app.use(express.json());


const userRouter = require('./routes/user');
const authenticaionRoute=require('./routes/authentication');
const adminRoute=require('./routes/admin');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));


app.use(passport.initialize());
app.use(passport.session());



app.use('/api/user',userRouter)
app.use('/api/auth',authenticaionRoute)
app.use('/api/admin',adminRoute)


app.get('/api',(req,res)=>{
  res.status(200).send("App is LIVE !")
})
app.listen(port,async()=>{
    console.log("Running on port "+ port)
})