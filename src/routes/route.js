const express = require('express')
const router = express.Router()
const bookController = require("../controller/bookController")
const userController = require("../controller/userController")
const reviewController = require("../controller/reviewController")
const middleware = require("../middleware/auth")




//--------------------------user Api----------------------------------
router.post("/register", userController.registerUser)
router.post("/login", userController.login)

//--------------------------Book Api----------------------------------
router.post("/books", middleware.authentication, middleware.authoization, bookController.createBook)
router.get("/books", middleware.authentication, bookController.getBooks)
router.get("/books/:bookId", middleware.authentication, bookController.getbookId)
router.put("/books/:bookId", middleware.authentication, middleware.authoization, bookController.updateBooks)
router.delete("/books/:bookId", middleware.authentication, middleware.authoization, bookController.deleteBook)


//--------------------------Review Api----------------------------------
router.post("/books/:bookId/review", reviewController.createReviews)
router.put("/books/:bookId/review/:reviewId", reviewController.updateReviews)
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview)



// global route>>>>>>>>>>
router.all("/**", function (req, res) {
    res.status(400).send({
        status: false,
        msg: "The api you request is not available"
    })
})


module.exports = router