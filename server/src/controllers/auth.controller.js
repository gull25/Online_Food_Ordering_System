const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
    register = asyncHandler(async (req, res) => {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    });

    login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json(result);
    });
}

module.exports = new AuthController();
