const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

//  Connect to Cloudinary 
cloudinary.config({
  cloud_name:    process.env.CLOUD_NAME,
  api_key:       process.env.CLOUD_API_KEY,
  api_secret:    process.env.CLOUD_API_SECRET,
});

// Storage Config 
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "wanderlust",          // folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

module.exports = { cloudinary, storage };