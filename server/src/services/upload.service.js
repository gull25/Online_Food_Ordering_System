const cloudinary = require('../config/cloudinary');

const uploadImage = async (fileBuffer, folder = 'foodora') => {
    // Fallback for local development if Cloudinary is not configured yet
    if (!process.env.CLOUDINARY_API_KEY) {
        console.warn('Cloudinary API key is missing. Returning a mock image URL.');
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400';
    }

    return new Promise((resolve, reject) => {
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
};

const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl) return;
        // Extract public ID from URL
        const parts = imageUrl.split('/');
        const fileWithExtension = parts[parts.length - 1];
        const publicId = fileWithExtension.split('.')[0];
        const folder = parts[parts.length - 2];

        await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};

module.exports = {
    uploadImage,
    deleteImage
};
