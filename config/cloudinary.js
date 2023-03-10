const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
require('dotenv').config()

// configure cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY
})

// Instance of cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png'],      // type of file you want to accept
    params: {                            // to which folder you to keep all your images
        folder: "blog-api",
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }                                                    // accepting specific size
})


module.exports = storage