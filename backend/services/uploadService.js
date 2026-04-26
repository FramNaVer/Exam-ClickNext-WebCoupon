const cloudinary = require('../lib/cloudinary');
const AppError = require('../utils/appError');

/**
 * Uploads a file buffer to Cloudinary.
 * @param {object} file - The file object from multer (req.file).
 * @returns {Promise<object>} The upload result from Cloudinary.
 */
exports.uploadImageStream = (file) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new AppError('Cloudinary is not configured', 500);
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'snapreward/rewards', resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(file.buffer);
    });
};

/**
 * Deletes an image from Cloudinary.
 * @param {string} publicId - The public ID of the image to delete.
 * @returns {Promise<object>} The deletion result from Cloudinary.
 */
exports.deleteImage = (publicId) => {
    if (!publicId) {
        return Promise.resolve({ result: 'ok', message: 'No public_id provided' });
    }
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
};