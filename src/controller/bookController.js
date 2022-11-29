const mongoose = require("mongoose");
const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel")
const uploadFile = require("../controller/awsFileUpload")



//Validation 
const isValid = function (value) {
    if (typeof value == 'undefined' || value == null) return false;
    if (typeof value == 'string' && value.trim().length == 0) return false;
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
            return res.status(400).send({ status: false, message: "title field is required" })
        }

        const isTitleAlreadyExist = await bookModel.findOne({ title: title })
        if (isTitleAlreadyExist) {
            return res.status(400).send({ status: false, message: "Title is already exists" })
        }

        //excerpt validation
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "excerpt is required" })
        }

        //userId validation
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is required" })
        }
        if (!isvalidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId  is not valid" })
        }

        const isUserIdExist = await userModel.findOne({ _id: userId })
        if (!isUserIdExist)
            return res.status(404).send({ status: false, message: "UserId not exists" })

        //ISBN validation
        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN is required" })
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
            return res.status(400).send({ status: false, message: "category is required" })
        }

        //sub-category validation
        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, message: "subcategory is required" })
        }

        //releaseAt validation
        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: "releasedAt date is required" })
        }
        if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(releasedAt)) {
            return res.status(400).send({ status: false, message: `Release date must be in "YYYY-MM-DD" format` })
        }

        //upload book cover(a file) by aws
        // let files = req.files
        // let uploadFileURL;
        // if (files && files.length > 0) {
        //     uploadFileURL = await uploadFile.uploadFile(files[0])
        // }
        // else{
        //     return res.status(400).send({message: "Please add book cover"})
        // }

        // let bookCover = uploadFileURL

        //Successfully creation of book
        let books = { title, excerpt, userId, ISBN, category, subcategory, releasedAt}
        let bookCreated = await bookModel.create(books)
        res.status(201).send({ status: true, message: "Book created successfully", data: bookCreated })

        // let pri = await bookModel.find({title:"On the Nature of Love"}).count()
        // console.log(pri)

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
                return res.status(400).send({ status: false, msg: "Please Enter a valid userID" })
            }
        }
        // let a = await bookModel.find({$and:[{category: "Novel"},{subcategory:"Novel"}]})//AND
        // console.log(a)
        // let pri = await bookModel
        // .find({$or:[{category:"Novel"}, {subcategory:"Novel"}]})//OR
        // .select({title : 1,bookCover : 1,_id:0})//.count()
        // console.log(pri)

        // let b = await bookModel.find().sort({"ISBN": -1})//SORT
        // console.log(b)

        // let c = await bookModel.find().sort({"ISBN": 1}).skip(3).limit(3).select({category: 1, subcategory: 1})
        // console.log(c)

        // let d = await bookModel.find({"title": {$eq: "Choke Bali"}})
        // console.log(d)

        // let e = await bookModel.find({"ISBN": {$lt: "01956214875" }})
        // console.log(e)

        let f = await bookModel.find({$or : [{category:{$eq : "Nature"}},{category :{$eq : "Novel"}}]})
        console.log(f)

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
            res.status(404).send({ status: false, message: "No Book found" })
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

        const reviews = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({ _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })
        const bookDetailsFinal = { _id: bookDetails._id, title: bookDetails.title, excerpt: bookDetails.excerpt, userId: bookDetails.userId, category: bookDetails.category, subcategory: bookDetails.subcategory, isDeleted: bookDetails.isDeleted, reviews: bookDetails.reviews, releasedAt: bookDetails.releasedAt, createdAt: bookDetails.createdAt, updatedAt: bookDetails.updatedAt, reviewData: reviews }

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
            return res.status(404).send({ status: false, message: "Book not found or already deleted" })
        }

        //correct details to update or not
        if (!(data.title || data.ISBN || data.excerpt || data.releaseDate)) {
            return res.status(400).send({ status: false, message: "Please enter the correct details to update" })
        }

        //title validation
        if (data.title) {
            if (!isValid(data.title)) {
                return res.status(400).send({ status: false, message: "title can not be empty" })
            }
            let usedTitle = await bookModel.findOne({ title: data.title })
            if (usedTitle) {
                return res.status(400).send({ status: false, message: "this title is already use, please entered a unique title" })
            }
        }

        if (data.excerpt) {
            if (!isValid(data.excerpt)) {
                return res.status(400).send({ status: false, message: "excerpt can not be empty" })
            }
        }

        //releasedAt validation
        if (data.releaseDate) {
            if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(data.releaseDate)) {
                return res.status(400).send({ status: false, message: `Release date must be in "YYYY-MM-DD" format or must be a valid date` })
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

        // let a = await bookModel.find({ISBN: {$nin:[ 975, 990 ]}})
        // console.log(a)

        // let b = await bookModel.findById("636292d3ead1de7ee62606f0")
        // console.log(b)

        // let c = await bookModel.findOne({category:"Novel"})
        // console.log(c)

        // let d = await bookModel.findByIdAndUpdate({_id : "62d048afcf8b77d572f5f547"},{ $set : { isDeleted: true}})
        // console.log(d)

        let e = await bookModel.updateMany({category: "Novel"}, {$set: {reviews: 1}})
        console.log(e)

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) { return res.status(404).send({ status: false, message: "book does not exist" }) }

        await bookModel.updateMany({ _id: bookId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date() } })
        await reviewModel.updateMany({ bookId: bookId }, ({ $set: { isDeleted: true } }))

        

        return res.status(200).send({ status: true, message: "Book deleted successfully" })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}





module.exports = { createBook, updateBooks, deleteBook, getBooks, getbookId }