const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

//Validation
const isValid = function (value) {
    if (typeof value === 'undefined' || value == null) return false
    if (typeof value == 'string' && value.trim().length === 0) return false
    return true
}


const isRequestBodyValid = function (requestBody) {
    return Object.keys(requestBody).length > 0
}


//===================================== CUser Registration==========================================
const registerUser = async function (req, res) {
    try {
        const getBodyData = req.body;
        const { title, name, phone, email, password, address } = getBodyData;

        if (!isRequestBodyValid(getBodyData)) {
            return res.status(400).send({ status: false, message: "Please Enter Data title, name, phone, email, password, address" });
        }

        //title validation
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Please Enter tilte" })
        }

        if (!["Mr", "Miss", "Mrs"].includes(title)) {
            return res.status(400).send({ status: false, message: "Please Enter valid title from 'Mr','Miss','Mrs'", })
        }

        //Name validation
        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: "Please Enter Name" })
        }

        if (!/^\w[a-zA-Z.\s]*$/.test(name)) {
            return res.status(400).send({ status: false, message: "The Name may contain only letters" })
        }

        //Phone Number Validation
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please Enter Phone Number" })
        }

        if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)) {
            return res.status(400).send({ status: false, message: " please enter valid Phone Number" })
        }

        let uniquePhoneNumber = await userModel.findOne({ phone: phone })
        if (uniquePhoneNumber) {
            return res.status(400).send({ status: false, message: "This Phone Number is already exists" })
        }

        //Email validation
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Please Enter Email" })
        }

        if (!/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email)) {
            return res.status(400).send({ status: false, msg: "Entered email is invalid" })
        }

        let uniqueEmail = await userModel.findOne({ email: email })
        if (uniqueEmail) {
            return res.status(400).send({ status: false, msg: "This email is already exists" })
        }

        //password validation
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Please Enter Password" })
        }

        if (!(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, msg: "Please use first letter in uppercase, lowercase and number with min. 8 and max. 15 length" })
        }

        //Address validation
        if (!isValid(address)) {
            return res.satus(400).send({ status: false, message: "Please Enter Address" })
        }
        if (address) {
            if (!isValid(address.street)) {
                return res.status(400).send({ status: false, message: "Please enter Street" })
            }

            if (!isValid(address.city)) {
                return res.status(400).send({ status: false, message: "Please enter City" })
            }

            if (!isValid(address.pincode)) {
                return res.status(400).send({ status: false, message: "Please enter Pincode" })
            }
            if (!/^\d{6}$/.test(address.pincode)) {
                return res.status(400).send({ status: false, message: "only number is accepted in pincode and Pincode length must be equal to 6", })
            }
        }

        //Successfully User Registration
        const createUser = await userModel.create(getBodyData);
        return res.status(201).send({ status: true, message: "Success", data: createUser });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};



//===================================== Login User ==========================================
const login = async function (req, res) {
    try {
        const credentials = req.body;
        if (!isRequestBodyValid(credentials)) {
            return res.status(400).send({ status: false, message: "Please provide login credentials" });
        }

        const { email, password } = credentials;
        //Email validation
        if (!isValid(email)) {
            return req.status(400).send({ status: false, message: "Email is required" })
        }
        if (!(/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/).test(email)) {
            return res.status(400).send({ status: false, message: "Please provide valid Email Id" });
        }

        //Password Validation
        if (!isValid(password)) {
            return req.status(400).send({ status: false, message: "Password is required" })
        }

        //user present or not
        let logIn = await userModel.findOne({ email, password });
        if (!logIn) {
            return res.status(400).send({ status: false, message: "Email and password is not correct" });
        }

        //Create JWT 
        const token = jwt.sign(
            {
                userId: logIn._id.toString(),
            },
            "SECRET-OF-GROUP23", {
            //expiresIn: "60min" //token validate only for 60 mins after creation
        }
        );
        res.setHeader("x-api-key", token);
        res.status(200).send({ status: true, message: "You are logged in", data: { token } });
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}


module.exports = { registerUser, login };