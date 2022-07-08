const { default: mongoose } = require("mongoose");
const bookModel = require("../models/bookModel");
const BookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
//const jwt = require("jsonwebtoken");


//Validation 
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


//===================================== Create Books==========================================
const createBook = async function (req, res) {
    try {
        const requestBody = req.body;

        //request body empty or not
        if (!isRequestBodyValid(requestBody)) {
            return res.status(400).send({ status: false, message: "request body can't be empty" })
        }

        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = req.body

        //title validation
        if (!isValid(title)) {
            res.status(400).send({ status: false, message: "title field is required" })
        }
        if (!/^\w[a-zA-Z.\s]*$/.test(title)) return res.status(400).send({ status: false, message: "The title must contain only letters" });

        const isTitleAlreadyExist = await bookModel.findOne({ title: title })
        if (isTitleAlreadyExist) {
            return res.status(400).send({ status: false, message: "Title is already exists" })
        }

        //excerpt validation
        if (!isValid(excerpt)) {
            res.status(400).send({ status: false, message: "excerpt is required" })
        }

        //userId validation
        if (!isValid(userId)) {
            res.status(400).send({ status: false, message: "userId is required" })
        }
        if (!isvalidObjectId(userId)) {
            res.status(400).send({ status: false, message: "userId  is not valid" })
        }

        const isUserIdExist = await userModel.findOne({ _id: userId })
        if (!isUserIdExist) return res.status(404).send({ status: false, message: "UserId not exists" })

        //ISBN validation
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

        //Category validation
        if (!isValid(category)) {
            res.status(400).send({ status: false, message: "category is required" })
        }

        //sub-category validation
        if (!isValid(subcategory)) {
            res.status(400).send({ status: false, message: "subcategory is required" })
        }

        //releaseAt validation
        if (!isValid(releasedAt)) {
            res.status(400).send({ status: false, message: "releaseAt date is required" })
        }
        if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt)) {
            return res.status(400).send({ status: false, message: `Release date must be in "YYYY-MM-DD" format` })
        }

        //Successfully creation of book
        let books = { title, excerpt, userId, ISBN, category, subcategory, releasedAt }
        let bookCreated = await BookModel.create(books)
        res.status(201).send({ status: true, message: "Book created successfully", data: bookCreated })

    } catch (err) {
        console.log(err.message)
        res.status(500).send({ error: err.message })
    }
};



//===================================== Get Books ==========================================

const getBooks = async function (req, res) {
    try {
        let data = req.query;

        if (data.userId) {
            if (!mongoose.isValidObjectId(data.userId)) {
                return res.status(400).send({ status: false, msg: "Please Enter authorID as a valid ObjectId" })
            }
        }
        const bookDetail = await bookModel
            .find({ $and: [data, { isDeleted: false }] })
            .select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1 })
            .sort({ title: 1 })

        if (bookDetail.length == 0) {
            return res.status(404).send({ status: false, msg: "No Book found" });
        }

        if (bookDetail.length > 0) {
            return res.status(200).send({ status: true, message: "Books List", data: bookDetail });
        }
        else {
            return res.status(404).send({ status: false, message: "No Book found" })
        }
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


//===================================== Get Books by bookId==========================================

const getbookId = async function (req, res) {
    try {
        let bookId = req.params.bookId

        if (!isvalidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "please enter valid bookId" })
        }

        let bookDetails = await bookModel.findOne({ _id: bookId, isDeleted: false })

        if (!bookDetails) {
            return res.status(404).send({ status: false, message: "No Book found" })
        }

        // const review = await reviewModel.find({ bookId : bookId, isDeleted: false})
        const bookDetailsFinal = { bookDetails }

        return res.status(200).send({ status: true, message: 'Books list', data: bookDetailsFinal })
    }
    catch (err) {

        return res.status(500).send({ status: false, msg: err.message })
    }
};


//===================================== Upadate Books==========================================

const updateBooks = async function (req, res) {
    try {
        let data = req.body
        let id = req.params.bookId
        let ISBN = data.ISBN

        //update body empty or not
        if (!isRequestBodyValid(data)) {
            return res.status(400).send({ status: false, message: "request body can't be empty" })
        }

        //check book available or not
        let book = await bookModel.findOne({ _id: id, isDeleted: false })
        if (!book) {
            return res.status(400).send({ status: false, message: "Book not found or already deleted" })
        }

        //correct details to update or not
        if (!(data.title || data.ISBN || data.excerpt || data.releaseDate)) {
            return res.status(400).send({ status: false, message: "Please enter correcct details to update" })
        }

        //title validation
        let usedTitle = await bookModel.findOne({ title: data.title })
        if (usedTitle) {
            return res.status(400).send({ status: false, message: "this title is already use, please entered a unique title" })
        }

        //releasedAt validation
        if (data.releaseDate) {
            if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(data.releaseDate)) {
                return res.status(400).send({ status: false, message: `Release date must be in "YYYY-MM-DD" format` })
            }
        }

        //ISBN validation
        if (data.ISBN) {
            if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)) {
                return res.status(400).send({ status: false, message: "The ISBN is not valid" });
            }
        }
        let usedISBN = await bookModel.findOne({ ISBN: ISBN })
        if (usedISBN) {
            return res.status(400).send({ status: false, message: "Book with this ISBN is already exist" })
        }

        //successfully book update
        let updateBook = await bookModel.findByIdAndUpdate({ _id: id }, { title: data.title, ISBN: data.ISBN, excerpt: data.excerpt, releasedAt: data.releaseDate }, { new: true })
        return res.status(200).send({ status: true, message: "Book Update Successfully", data: updateBook })
    }
    catch (err) {
        return res.status(500).send({ error: err.message });
    }
}


//===================================== Delete Books==========================================


const deleteBook = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) { return res.status(404).send({ status: false, message: "book does not exist" }) }

        await bookModel.updateMany({ _id: bookId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } }) //reviewModel hoga
        // await reviewModel.updateMany({bookId: bookId}, ({$set:{isDeleted: true}}))

        return res.status(200).send({ status: true, message: "Book deleted successfully" })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}





module.exports = { createBook, updateBooks, deleteBook, getBooks, getbookId }