const aws = require('aws-sdk')


aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})



// let upload = async function (file) {
//     return new Promise(function (resolve, reject) {
//         let s3 = new aws.S3({ apiVersion: '2006-03-01' });

//         var uploadParams = {
//             ACL: "public-read",
//             Bucket: "classroom-training-bucket",
//             Key: "radonGroup23/" + file.originalname,
//             Body: file.buffer
//         }


//         s3.upload(uploadParams, function (err, data) {
//             if (err) {
//                 return reject({ "error": err })
//             }
//             console.log("file uploaded successfully")
//             return resolve(data.Location)
//         })
//     })
// }

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
      
      let s3 = new aws.S3({ apiVersion: '2006-03-01' }); //give access to upload the file to s3
  
      var uploadParams = {
        ACL: "public-read",  //access control list
        Bucket: "classroom-training-bucket",  
        Key: "radongroup23/" + file.originalname, 
        Body: file.buffer
      }
  
  
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          return reject({ "error": err })
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
      })
   })
  }



// let uploadFile = async function (files) {
//     try {
//         // let files = req.files
//         if (files && files.length > 0) {
//             let uploadFileURL = await upload(files[0])
//             // res.status(201).send({ message: "file uploaded successfully", data: uploadFileURL })
//             return uploadFileURL
//         }
//         // else {
//         //     res.status(400).send({ message: "No file found" })
//         // }
//     }
//     catch (err) {
//         res.status(500).send({ message: err })
//     }
// }


module.exports.uploadFile = uploadFile