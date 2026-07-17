const userRepository = require('../repositories/user.repository');
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
            return {
                success: true,
                token: generateToken(user._id),
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                },
            };
        } else {
            throw new ApiError(401, 'Invalid email or password');
        }
    }
}

module.exports = new AuthService();
