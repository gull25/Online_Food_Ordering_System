const asyncHandler = require('../utils/asyncHandler');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');
const { uploadImage, deleteImage } = require('../services/upload.service');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
    // Only allow updating name and phone
    const { name, phone } = req.body;
    
    const updateData = {
        ...(name && { name }),
        ...(phone && { phone })
    };

    if (req.file) {
        const currentUser = await userRepository.findById(req.user.id);
        if (currentUser && currentUser.avatar) {
            await deleteImage(currentUser.avatar);
        }
        const avatarUrl = await uploadImage(req.file.buffer, 'users');
        updateData.avatar = avatarUrl;
    }

    const user = await userRepository.updateById(req.user.id, updateData);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Toggle restaurant in user's wishlist/favorites
// @route   PUT /api/users/favorites/:restaurantId
// @access  Private
exports.toggleFavorite = asyncHandler(async (req, res, next) => {
    const { restaurantId } = req.params;
    
    let user = await userRepository.findById(req.user.id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Initialize array if it doesn't exist
    if (!user.favorites) {
        user.favorites = [];
    }

    const index = user.favorites.indexOf(restaurantId);
    
    if (index === -1) {
        // Add to favorites
        user.favorites.push(restaurantId);
    } else {
        // Remove from favorites
        user.favorites.splice(index, 1);
    }

    await user.save();

    res.status(200).json({
        success: true,
        data: user.favorites
    });
});
