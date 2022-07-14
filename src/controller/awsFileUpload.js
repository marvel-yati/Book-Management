const aws = require('aws-sdk')




let upload = async function (file) {
    return new Promise(function (resolve, reject) {
        let s3 = new aws.S3({ apiVersion: '2006-03-01' });

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "radonGroup23/" + file.originalname,
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log("file uploaded successfully")
            return resolve(data.Location)
        })
    })
}


let uploadFile = async function (req, res) {
    try {
        let files = req.files
        if (files && files.length > 0) {
            let uploadFileURL = await upload(files[0])
            res.status(201).send({ message: "file uploaded successfully", data: uploadFileURL })
        }
        else {
            res.status(400).send({ message: "No file found" })
        }
    }
    catch (err) {
        res.status(500).send({ message: err })
    }
}

module.exports.uploadFile = uploadFile