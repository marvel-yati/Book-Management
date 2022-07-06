const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const registerUser = async function (req, res) {
    try {
        const getBodyData = req.body;
        const { title, name, phone, email, password, address } = getBodyData;

        if (Object.keys(getBodyData).length == 0) {
            return res.status(400).send({
                status: false,
                message:
                    "Please Enter Data title, name, phone, email, password, address",
            });

        }
        if (!title) { return res.status(400).send({ status: false, message: "Please Enter Title" }) }

        if (title !== "string") return res.status(400).send({ status: false, message: "Please enter Title as a String" });

        if (!["Mr", "Miss", "Mrs"].includes(title)) {
            return res.status(400).send({ status: false, message: "Please Enter valid title from 'Mr','Miss','Mrs'", })
        }

        if (!name) { return res.status(400).send({ status: false, message: "Please Enter Name" }) }

        if (name !== "string") return res.status(400).send({ status: false, message: "Please enter Name as a String" })

        if (!/^\w[a-zA-Z.\s]*$/.test(name)) return res.status(400).send({ status: false, message: "The Name may contain only letters" });

        if (!phone) { return res.status(400).send({ status: false, message: "Please Enter Phone" }) }

        if (!/^(\+\d{1,3}[- ]?)?\d{10}$/.test(phone)) return res.status(400).send({ status: false, message: " please enter valid Mobail Number" });

        let uniquePhoneNumber = await userModel.findOne({ phone: phone })
        if (uniquePhoneNumber) return res.status(400).send({ status: false, message: "This Phone already exists" })

        if (!email) { return res.status(400).send({ status: false, message: "Please Enter Email" }) }
        if (email !== "string") return res.status(400).send({ status: false, message: "Please enter Email as a String" })
        if (!/^([0-9a-z]([-\\.][0-9a-z]+))@([a-z]([-\\.][a-z]+))[\\.]([a-z]{2,9})+$/.test(email)) return res.status(400).send({ status: false, msg: "Entered email is invalid" });
        let uniqueEmail = await userModel.findOne({ email: email })
        if (uniqueEmail) return res.status(400).send({ status: false, msg: "This email already exists" })

        if (!password) { return res.status(400).send({ status: false, message: "Please Enter Password" }) }
        if (!(/^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, msg: "Please use first letter in uppercase, lowercase and number with min. 8 and max. 15 length" })
        }

        if (address.street !== "string") return res.status(400).send({ status: false, message: "Please enter Street as a String" })
        if (address.city !== "string") return res.status(400).send({ status: false, message: "Please enter City as a String" })
        if (address.pincode !== "string") return res.status(400).send({ status: false, message: "Please enter Pincode as a String" })
        if (!/^\d{6}$/.test(address.pincode)) { return res.status(400).send({ status: false, message: "only number is accepted in pincode ", }); }




        const createUser = await userModel.create(getBodyData);
        return res
            .status(201)
            .send({ status: true, message: "Success", data: createUser });

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};



const login = async function(req, res)
{
    try{
        const credentials = req.body;
        if(!isRequestBodyValid(credentials))
        {
            res.status(400).send({status: false, msg: "Please provide login credentials"});
            return;
        }
        if(!validator.validate(credentials.email))
        {
            res.status(400).send({status: false, msg: "Please provide valid Email Id"});
            return;
        }
        const {name, password } = credentials;
        let logIn = await userModel.findOne({name, password}); 
        if(!logIn)
        {
            return res.status(400).send({status: false, msg: "Name and password is not correct"});
        }
        const token = jwt.sign(
            {
                userId: logIn._id.toString(),
            },
            "SECRET-OF-GROUP23"
        );
        res.setHeader("x-api-key",token);
        res.status(200).send({status: true, msg: "You are logged in!!!", data: {token}});
    }
    catch(err){
        res.status(500).send({status: false, msg: err.message});    
    }
}


module.exports = { registerUser, login };