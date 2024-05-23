const express=require('express')
require('dotenv').config();
const cors = require('cors');
const userRouter = require('./routes/user');
const authenticaionRoute=require('./routes/authentication');
const passport=require('passport');
const session=require('express-session');
const User = require('./models/user');
const app=express()
const port=8000
require('./db/mongoose')
app.use(cors())
app.use(express.json())
require('./passportConfig')
app.use(express.json());


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


app.get('/api',(req,res)=>{
  res.status(200).send("App is LIVE !")
})
app.listen(port,async()=>{
    console.log("Running on port "+ port)
})