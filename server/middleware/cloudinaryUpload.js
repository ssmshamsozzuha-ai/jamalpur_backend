const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "jamalpur-chamber", // Main folder for all uploads
    allowed_formats: ["pdf", "jpg", "jpeg", "png", "gif"],
    resource_type: "auto", // Automatically detect file type
    transformation: [
      // For images, apply optimization
      {
        if: "w_>_1000",
        width: 1000,
        quality: "auto",
        fetch_format: "auto"
      }
    ]
  },
});

// Create multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow PDF files and images
    const allowedMimes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg", 
      "image/png",
      "image/gif"
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log(`✅ Deleted file from Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting file from Cloudinary: ${error.message}`);
  }
};

// Helper function to get file URL from Cloudinary
const getFileUrl = (publicId, resourceType = "auto") => {
  if (!publicId) return null;
  
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    secure: true,
    quality: "auto",
    fetch_format: "auto"
  });
};

module.exports = {
  upload,
  deleteFromCloudinary,
  getFileUrl,
  cloudinary
};
