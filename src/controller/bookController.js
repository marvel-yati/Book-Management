const { default: mongoose } = require("mongoose");
const bookModel = require("../models/bookModel");
const BookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
//const jwt = require("jsonwebtoken");


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
}

const isRequestBodyValid = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isvalidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}


//create book
const createBook = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!isRequestBodyValid(requestBody)) {
            return res.status(400).send({ status: false, message: "request body can't be empty" })
        }

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = req.body

        //validation starts
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: "title field is required" })
        }
        if (!/^\w[a-zA-Z.\s]*$/.test(title)) return res.status(400).send({ status: false, message: "The title must contain only letters" });

        const isTitleAlreadyExist = await bookModel.findOne({ title: title })
        if (isTitleAlreadyExist) {
            return res.status(400).send({ status: false, message: "Title is already exists" })
        }

        if (!isValid(excerpt)) {
            res.status(400).send({ status: false, message: "excerpt is required" })
        }
        if (!isValid(userId)) {
            res.status(400).send({ status: false, message: "userId is required" })
        }
        if (!isvalidObjectId(userId)) {
            res.status(400).send({ status: false, message: "userId  is not valid" })
        }

        const isUserIdExist = await userModel.findOne({ _id: userId })
        if (!isUserIdExist) return res.status(404).send({ status: false, message: "UserId not exists" })


        if (!isValid(ISBN)) {
            res.status(400).send({ status: false, message: "ISBN is required" })
        }
        if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)) {
        return res.status(400).send({ status: false, message: "The ISBN is not valid" });
        }

        const isISBNAlreadyUsed = await bookModel.findOne({ ISBN })
        if (isISBNAlreadyUsed) {
            return res.status(400).send({ status: false, message: "ISBN is already used" })
        }


        if (!isValid(category)) {
            res.status(400).send({ status: false, message: "category is required" })
        }
        if (!isValid(subcategory)) {
            res.status(400).send({ status: false, message: "subcategory is required" })
        }
        if (!isValid(releasedAt)) {
            res.status(400).send({ status: false, message: "reviews is required" })
        }
        if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt)) {
            return res.status(400).send({ status: false, message: `Release date must be in "YYYY-MM-DD" format` })
        }
        //validations ends
        console.log(releasedAt)

        let books = { title, excerpt, userId, ISBN, category, subcategory, releasedAt }
        let bookCreated = await BookModel.create(books)
        res.status(201).send({ status: true, message: "Book created successfully", data: bookCreated })

    } catch (err) {
        console.log(err.message)
        res.status(500).send({ error: err.message })
    }
};


module.exports.createBook = createBook