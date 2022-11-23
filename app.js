require('dotenv').config()
const express = require('express')
require('./database/database').connect()
const User = require('./model/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const app = express()
app.use(express.json())
app.use(cookieParser())

app.get("/", ((req,res) => {
    res.send("<h1>Server is Working</h1>")
}))

app.post("/register", async (req,res) => {
    try {
        // get all data from body
        const {firstname, lastname, email, password} = req.body;
        // all the data should exists
        if(!(firstname && lastname && email && password)){
            res.status(400).send('All fields are compulsory')
        }
        // check if user already exists - email
        const existingUser = await User.findOne({email})

        if(existingUser){
            res.status(401).send('User already exist with this email')
        }
        // encrypt the password
        const myEncPassword = await bcrypt.hash(password,10)
        // save the user in DB
        const user = await User.create({
            firstname,
            lastname,
            email,
            password : myEncPassword
        })
        // generate a token for user and send it
        const token = jwt.sign(
            {id: user._id, email},
            'shhhh', // process.env.jwtsecret
            {
                expiresIn: "2h"
            }
        )
        user.token = token 
        user.password = undefined
        
        res.status(201).json(user)
    } catch (error) {
        console.log(error);
    }
})

app.post('/login', async (req,res) => {
    try {
        // get all data from frontend
        const {email,password} = req.body
        // all the data should exists
        if(!(email && password)){
            res.status(400).send('All fields are compulsory')
        }
        // find user in DB
        const user = await User.findOne({email});
        // if user is not there
        if(!user){
            res.status(401).send('User does not with this email')
        }
        // match the password
        if(user && (await bcrypt.compare(password,user.password))){
            const token = jwt.sign(
                {id: user._id},
                'shhhh', // process.env.jwtsecret
            {
                expiresIn: "2h"
            }
            );
            user.token = token
            user.password = undefined

            // send token in user cookie
            const opttions = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.status(200).cookie("token",token,options).json({
                success: true,
                token,
                user
            })

            res.status(201).json(user)
        }
        // send a token  
    } catch (error) {
        console.log(error);
    }
})

module.exports = app