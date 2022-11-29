const jwt = require('jsonwebtoken')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')

//===================================== Authentication ==========================================

const authentication = function (req, res, next) {
    try {
        const token = req.header('x-api-key')
        if (!token) {
            return res.status(401).send({ status: false, message: "Authentication token is required in header" })
        }

        jwt.verify(token, "SECRET-OF-GROUP23", function (err, decoded) {
            if (err) {
                return res.status(403).send({ status: false, message: "Invalid authentication token in header" })
            }
            else {
                req.token = decoded;
                next();
            }
        })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
//cookies(credentials stored)
//SESSION
//===================================== Authorization ==========================================

const authoization = async function (req, res, next) {
    try {
        let token = req.header('x-api-key')
        let bookId = req.params.bookId
        let bodyUserId = req.body.userId
        if (!token) {
            return res.status(401).send({ status: false, message: "Authentication token is required in header" })
        }

        if (bookId) {
            if (!mongoose.isValidObjectId(bookId)) {
                return res.status(400).send({ status: false, msg: "Please Enter a valid bookID" })
            }
        }
        if (bodyUserId) {
            if (!mongoose.isValidObjectId(bodyUserId)) {
                return res.status(400).send({ status: false, msg: "Please Enter a valid UserID" })
            }
        }

        let decodedToken = jwt.verify(token, "SECRET-OF-GROUP23")

        let findBook = await bookModel.findById(bookId);
        if (findBook) {
            if (decodedToken.userId != findBook.userId) {
                return res.status(403).send({ status: false, msg: "User is not authorized to access this data" });
            }
        }

        if (bodyUserId) {
            if (bodyUserId !== decodedToken.userId) {
                return res.status(403).send({ status: false, msg: "User is not authorized to access this data" });
            }
        }
        next()
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


module.exports.authentication = authentication
module.exports.authoization = authoization