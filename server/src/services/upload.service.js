const cloudinary = require('../config/cloudinary');
const sharp = require('sharp');

const uploadImage = async (fileBuffer, folder = 'foodora') => {
    // Fallback for local development if Cloudinary is not configured yet
    if (!process.env.CLOUDINARY_API_KEY) {
        console.warn('Cloudinary API key is missing. Returning a mock image URL.');
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
    }

    try {
        return await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'image',
                    transformation: (folder === 'foodora/offers' || folder === 'foodora/banners')
                        ? [ { fetch_format: 'auto', quality: 'auto' } ]
                        : [
                            { width: 800, height: 800, crop: 'pad' },
                            { fetch_format: 'auto', quality: 'auto' }
                          ]
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                }
            );
            uploadStream.end(fileBuffer);
        });
    } catch (error) {
        console.warn('Cloudinary upload failed (possibly network issue), falling back to base64 Data URI:', error.message);
        
        try {
            // Compress heavily and convert to base64 for MongoDB storage fallback
            const compressedBuffer = await sharp(fileBuffer)
                .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 75 })
                .toBuffer();
                
            return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
        } catch (sharpError) {
            console.error('Sharp compression fallback also failed:', sharpError);
            throw error; // Throw original Cloudinary error if fallback fails
        }
    }
};

const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl) return;
        
        // Don't try to delete base64 strings or non-Cloudinary URLs
        if (imageUrl.startsWith('data:image/')) return;
        if (imageUrl.startsWith('http') && !imageUrl.includes('res.cloudinary.com')) return;

        // Extract public ID from URL
        const parts = imageUrl.split('/');
        const fileWithExtension = parts[parts.length - 1];
        const publicId = fileWithExtension.split('.')[0];
        const folder = parts[parts.length - 2];

        await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error.message);
    }
};

module.exports = {
    uploadImage,
    deleteImage
};
