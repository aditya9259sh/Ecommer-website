const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit' },
      { quality: 'auto:good' }
    ]
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Single file upload
const uploadSingle = upload.single('image');

// Multiple files upload
const uploadMultiple = upload.array('images', 10);

// Handle upload errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name in upload.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Upload file to Cloudinary (for base64 or URL)
const uploadToCloudinary = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: options.folder || 'ecommerce',
      transformation: [
        { width: options.width || 1000, height: options.height || 1000, crop: 'limit' },
        { quality: 'auto:good' }
      ],
      ...options
    };

    let result;
    if (file.startsWith('data:')) {
      // Base64 file
      result = await cloudinary.uploader.upload(file, uploadOptions);
    } else if (file.startsWith('http')) {
      // URL file
      result = await cloudinary.uploader.upload(file, uploadOptions);
    } else {
      throw new Error('Invalid file format');
    }

    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// Generate optimized image URLs
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 800,
    height: 800,
    crop: 'fill',
    quality: 'auto:good',
    format: 'auto'
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, finalOptions);
};

// Generate thumbnail URL
const getThumbnailUrl = (publicId, size = 150) => {
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto:good'
  });
};

// Generate responsive image URLs
const getResponsiveImageUrls = (publicId) => {
  const sizes = [320, 640, 768, 1024, 1280];
  
  return sizes.map(size => ({
    size,
    url: cloudinary.url(publicId, {
      width: size,
      height: size,
      crop: 'limit',
      quality: 'auto:good'
    })
  }));
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  deleteFile,
  uploadToCloudinary,
  getOptimizedImageUrl,
  getThumbnailUrl,
  getResponsiveImageUrls,
  cloudinary
};
