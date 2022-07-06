const express = require('express')
const router = express.Router()
const bookController = require("../controller/bookController")
const userController = require("../controller/userController")
// const reviewController = require("../controller/reviewController")
const middleware = require("../middleware/auth")




//--------------------------user Api----------------------------------
router.post("/register", userController.registerUser)
router.post("/login", userController.login)

//--------------------------Book Api----------------------------------
router.post("/books", middleware.authentication, bookController.createBook)


//--------------------------Review Api----------------------------------


module.exports = router