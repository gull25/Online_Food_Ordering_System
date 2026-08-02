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

    forgotPassword = asyncHandler(async (req, res) => {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.status(200).json(result);
    });

    resetPassword = asyncHandler(async (req, res) => {
        const { password } = req.body;
        const result = await authService.resetPassword(req.params.token, password);
        res.status(200).json(result);
    });
}

module.exports = new AuthController();
