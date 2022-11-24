const jwt = require('jsonwebtoken')

const auth = (req,res,next) => {
    // grab token from cookie
    console.log(req.cookies)
    const {token} = req.cookies
    // if no token, stop there
    if(!token){
        res.send(403).send('Please login first')
    }
    // decode that token and get id
    const decode = jwt.verify(token,process.env.JWTSECRET)
    console.log(decode)
    // query to DB for that user id
    

    return next()
}

module.exports = auth