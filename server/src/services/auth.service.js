const userRepository = require('../repositories/user.repository');
const Restaurant = require('../models/Restaurant');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const User = require('../models/User');

class AuthService {
    async register(userData) {
        const { name, email, password, phone } = userData;

        const userExists = await userRepository.findByEmail(email);
        if (userExists) {
            throw new ApiError(400, 'User already exists');
        }

        const user = await userRepository.create({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            role: userData.role || 'customer'
        });

        // Auto-create Rider profile if role is 'rider'
        if (user.role === 'rider') {
            const Rider = require('../models/Rider');
            // Provide dummy restaurant and phone to pass validation for now
            // Normally rider selects restaurant during onboarding
            const dummyRestaurant = await require('../models/Restaurant').findOne() || null;
            await Rider.create({
                user: user._id,
                name: user.name,
                phone: user.phone || '000-000-0000',
                restaurant: dummyRestaurant ? dummyRestaurant._id : null
            });
        }

        if (!user) {
            throw new ApiError(400, 'Invalid user data');
        }

        return {
            success: true,
            message: 'Registration successful',
        };
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email, true);

        if (user && (await user.matchPassword(password))) {
            let restaurantId = null;
            let restaurantStatus = null;
            if (user.role === 'restaurant_admin') {
                const restaurant = await Restaurant.findOne({ owner: user._id });
                if (restaurant) {
                    restaurantId = restaurant._id.toString();
                }
            }

            return {
                success: true,
                token: generateToken(user._id),
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    restaurantId: restaurantId,
                },
            };
        } else {
            throw new ApiError(401, 'Invalid email or password');
        }
    }

    async forgotPassword(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, 'There is no user with that email');
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message,
                html: `<p>You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`
            });

            return { success: true, data: 'Email sent' };
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            throw new ApiError(500, 'Email could not be sent');
        }
    }

    async resetPassword(resetToken, newPassword) {
        // Get hashed token
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            throw new ApiError(400, 'Invalid token');
        }

        // Set new password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return {
            success: true,
            token: generateToken(user._id)
        };
    }
}

module.exports = new AuthService();
