const jwt = require('jsonwebtoken')
const bookModel =require('../models/bookModel')
const userModel =require('../models/userModel')


const authentication = async function ( req, res, next){
    try{
        const token = req.header('x-api-key')
        if(!token){
            return res.status(401).send({ status: false, message: "Authentication token is required in header"})
        }
        const decodedToken = jwt.verify(token, "SECRET-OF-GROUP23")
        if(!decodedToken){
            return res.status(403).send({status: false, message: "Invalid authentication token in header"})
        }
        req.userId = decodedToken.userId

        next()

    }catch(err){
        res.status(500).send({ status:false, message: err.message})
    }
}


module.exports.authentication = authentication