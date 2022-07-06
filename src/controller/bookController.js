const BookModel = require("../models/bookModel")
//const jwt = require("jsonwebtoken");



//create book
const createBook = async function (req, res) {
    try {
        const { title, excerpt, userId, ISBN, category, subcategory, reviews } = req.body

        //validation starts
        if (!title) {
            res.status(400).send({ status: false, msg: "title field is required" })
        } else if (!excerpt) {
            res.status(400).send({ status: false, msg: "excerpt is required" })
        } else
            if (!userId) {
                res.status(400).send({ status: false, msg: "userId is required" })
            } else {
                const user = await BookModel.findById(userId);
                if (!userId) {
                    res.status(400).send({ status: false, msg: "userId  is not valid" })
                } else
                    if (!ISBN) {
                        res.status(400).send({ status: false, msg: "ISBN is required" })
                    } else
                        if (!category) {
                            res.status(400).send({ status: false, msg: "category is required" })
                        } else
                            if (!subcategory) {
                                res.status(400).send({ status: false, msg: "subcategory is required" })
                            } else
                                if (!reviews) {
                                    res.status(400).send({ status: false, msg: "reviews is required" })
                                }


                //validations ends

                let books = {
                    title,
                    excerpt,
                    userId,
                    ISBN,
                    category,
                    subcategory,
                    reviews
                    // ispublished: ispublished ? ispublished : false,
                    // publishedAt: ispublished ? new Date() : null
                }
                let bookCreated = await BookModel.create(books)
                res.status(201).send({ status: true, data: bookCreated })

            }


    } catch (err) {
        console.log(err.message)
        res.status(500).send({ error: err.message })
    }
};


module.exports.createBook = createBook