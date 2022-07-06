const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const bookSchema = new mongoose.Schema({
    title: {
        type: string,
        required: true,
        unique: true,
        trim: true
    },
    excerpt: {
        type: string,
        required: true,
        trim: true
    },
    userId: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    ISBN: {
        type: string,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: string,
        required: true,
        trim: true
    },
    subcategory: {
        type: [string],
        required: true,
        trim: true
    },
    reviews: {
        type: Number,
        default: 0
    },
    deletedAt: Date,
    
    isDeleted: {
        type: boolean,
        default: false
    },
    releasedAt: {
        type: Date,
        required: true
    },

}, { timestamps: true });


module.exports = mongoose.model("Book", bookSchema)