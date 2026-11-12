import express from 'express';
import { upload } from '../config/cloudinary.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/upload - Upload product image to Cloudinary
// Expects multipart form data with a field named "image"
router.post('/', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'No file uploaded or invalid file format' 
        });
    }

    // req.file.path contains the secure Cloudinary image URL
    res.status(200).json({
        success: true,
        message: 'Image uploaded successfully to Cloudinary',
        url: req.file.path,
        publicId: req.file.filename
    });
});

export default router;
