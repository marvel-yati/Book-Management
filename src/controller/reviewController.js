const { default: mongoose } = require("mongoose");
const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel")



const isRequestBodyValid = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isvalidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
}



const createReviews = async function (req, res) {
    try {
        data = req.body;
        let bookId = req.params.bookId;
        let id = req.body.bookId

        if (!isRequestBodyValid(data)) {
            return res.status(400).send({ status: false, message: "Request body can't be empty" })
        }

        if (!isvalidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Please enter a valid bookId in params" })
        }
        if (!isvalidObjectId(id)) {
            return res.status(400).send({ status: false, message: "Please enter a valid bookId in request body" })
        }

        if (bookId !== id) {
            return res.status(400).send({ status: false, message: "Params bookId and requested bookID not same" })
        }

        if (!bookId) {
            return res.status(400).send({ status: false, message: "Book Id is required" });
        }

        let bookAvailable = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!bookAvailable) {
            return res.status(404).send({ status: false, message: "Book doesn't exist" })
        }

        if (!/^\w[a-zA-Z.\s]*$/.test(data.reviewedBy)) {
            return res.status(400).send({ status: false, message: "The Name may contain only letters" })
        }

        if (!isValid(data.rating)) {
            return res.status(400).send({ status: false, message: "Please enter your rating" });
        }

        if ((data.rating < 1 || data.rating > 5)) {
            return res.status(400).send({ status: false, message: "Rating should be in Number and range must be 1-5" })
        }

        if (!isValid(data.reviewedAt)) {
            return res.status(400).send({ status: false, message: "ReviewedAt is required" });
        }

        if (data.review) {
            if (!isValid(data.review)) {
                return res.status(400).send({ status: false, message: "Review cann't be empty" });
            }
        }

        if (data.reviewedAt) {
            if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(data.reviewedAt)) {
                return res.status(400).send({ status: false, message: `Release date must be in "YYYY-MM-DD" format or must be a valid date` })
            }
        }

        let reviewCreated = await reviewModel.create(data)
        let finalData = ({ _id: reviewCreated.id, bookId: reviewCreated.bookId, reviewedBy: reviewCreated.reviewedBy, reviewedAt: reviewCreated.reviewedAt, rating: reviewCreated.rating, review: reviewCreated.review })

        await bookModel.updateOne({ _id: bookId }, { $inc: { reviews: +1 } })
        let book = await bookModel.findOne({ _id: bookId }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1, isDeleted: 1, reviews: 1, releasedAt: 1, createdAt: 1, updatedAt: 1 })
        let final = ({ _id: book._id, title: book.title, excerpt: book.excerpt, userId: book.userId, category: book.category, subcategory: book.subcategory, isDeleted: book.isDeleted, reviews: book.reviews, releasedAt: book.releasedAt, createdAt: book.createdAt, updatedAt: book.updatedAt, reviewData: finalData })
        res.status(201).send({ status: true, message: "Review created successfully", data: final });

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}




const updateReviews = async function (req, res) {
    try {
        let data = req.body;
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!isvalidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Please enter a valid bookId in params" })
        }

        const existBookId = await bookModel.findOne({ _id: bookId, bookId: bookId, isDeleted: false })
        if (!existBookId) {
            return res.status(404).send({ status: false, message: " Book not found" })
        }

        if (!isvalidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "Please enter a valid reviewId in params" })
        }

        const existReviewId = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })
        if (!existReviewId) {
            return res.status(404).send({ status: false, message: " review not found" })
        }


        if (!isRequestBodyValid(data)) {
            return res.status(400).send({ status: false, msg: "Request body can't be empty" });
        }

        if (data.review) {
            if (!isValid(data.review)) {
                return res.status(400).send({ status: false, msg: "Please Enter Review" });
            }
        }
        if ((data.rating < 1 || data.rating > 5)) {
            return res.status(400).send({ status: false, message: "Rating should be in Number and range must be 1-5" })
        }
        if (data.reviewedBy) {
            if (!/^\w[a-zA-Z.\s]*$/.test(data.reviewedBy)) {
                return res.status(400).send({ status: false, message: "The Name may contain only letters" })
            }
        }

        let updateReview = await reviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { review: data.review, rating: data.rating, reviewedBy: data.reviewedBy, reviewedAt: Date.now() } }, { new: true })

        let finalData = ({ _id: updateReview.id, bookId: updateReview.bookId, reviewedBy: updateReview.reviewedBy, reviewedAt: updateReview.reviewedAt, rating: updateReview.rating, review: updateReview.review })

        let book = await bookModel.findOne({ _id: bookId })
        let final = ({ _id: book._id, title: book.title, excerpt: book.excerpt, userId: book.userId, category: book.category, subcategory: book.subcategory, isDeleted: book.isDeleted, reviews: book.reviews, releasedAt: book.releasedAt, createdAt: book.createdAt, updatedAt: book.updatedAt, reviewData: finalData })
        
        res.status(200).send({ status: true, msg: "Review Updated Successfully", data: final });
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}



const deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!isvalidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Please enter a valid bookId in params" })
        }

        if (!isvalidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "Please enter a valid reviewId in params" })
        }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: "Book not exist" })
        }

        let review = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false })
        if (!review) {
            return res.status(404).send({ status: false, message: "Review not exist" })
        }

        await reviewModel.findByIdAndUpdate({ _id: reviewId, bookId: bookId }, { $set: { isDeleted: true, deletedAt: Date.now() } }, { new: true })
        await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })
        return res.status(200).send({ status: true, message: "Review Deleted Successfully" })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


module.exports = { createReviews, updateReviews, deleteReview }