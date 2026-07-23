const asyncHandler = require('../utils/asyncHandler');
const userRepository = require('../repositories/user.repository');
const ApiError = require('../utils/ApiError');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
    // Only allow updating name and phone
    const { name, phone } = req.body;

    const user = await userRepository.updateById(req.user.id, {
        ...(name && { name }),
        ...(phone && { phone })
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
        success: true,
        data: user
    });
});
