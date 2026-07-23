const userRepository = require('../repositories/user.repository');
const Restaurant = require('../models/Restaurant');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');

class AuthService {
    async register(userData) {
        const { name, email, password, phone } = userData;

        const userExists = await userRepository.findByEmail(email);
        if (userExists) {
            throw new ApiError(400, 'User already exists');
        }

        const user = await userRepository.create({
            name,
            email,
            password,
            phone,
        });

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
            if (user.role === 'admin') {
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
}

module.exports = new AuthService();
