const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    title: {
        type: string,
        required: true,
        enum: ["Mr", "Mrs", "Miss"],
        trim: true
    },
    name: {
        type: string,
        required: true,
        trim: true
    },
    phone: {
        type: string,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: string,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: string,
        required: true,
        minlength: 8,
        maxlength: 15
    },
    address: {
        street: { type: string },
        city: { type: string },
        pincode: { type: string }
    },

}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)