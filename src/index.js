const express = require('express')
const bodyParser = require('body-parser')
const route = require('./routes/route')
const multer = require('multer')
const mongoose = require('mongoose')
const app = express()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))
app.use(multer().any())



mongoose.connect("mongodb+srv://debayatisarkar:cI2Ty1yHOKIVgSkh@bookmanagement.6gwntxc.mongodb.net/BookManagement",
    { useNewUrlParser: true })

    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route)

app.listen(process.env.port || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
})
