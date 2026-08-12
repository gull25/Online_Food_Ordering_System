const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");
const Rider = require("../models/rider.model");
const userRepository = require("../repositories/user.repository");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");
const { signToken } = require("../config/jwt");
const env = require("../config/env");

/*
 * A bcrypt comparison against a throwaway hash, used to keep the failure path of
 * `login` roughly as slow as the success path. Without it, "no such user"
 * returns in microseconds while "wrong password" takes ~80ms, and that gap alone
 * tells an attacker which email addresses are registered.
 */
const DUMMY_HASH = bcrypt.hashSync("timing-equalisation-placeholder", 10);

class AuthService {
    /**
     * Creates an account.
     *
     * Self-service signup for the three participant roles is a product feature
     * (the form has an "Account type" selector), but the old code took the role
     * straight off `userData.role` with no allowlist at all. Since `validate`
     * also discarded its parsed output, *any* string reached the model — so a
     * crafted request could create an account with a role the UI never offers,
     * and `admin` in particular unlocks the platform-wide analytics and order
     * export endpoints. The enum below is the boundary: privileged roles can
     * only be granted out of band.
     */
    async register({ name, email, password, phone, role }) {
        const SELF_SERVICE_ROLES = ["customer", "restaurant_admin", "rider"];
        const resolvedRole = SELF_SERVICE_ROLES.includes(role) ? role : "customer";

        const existing = await userRepository.findByEmail(email);
        if (existing) {
            // Registration inherently reveals whether an address is taken, so
            // there is nothing to hide here — but the message stays neutral about
            // *which* account it is.
            throw new ApiError(409, "An account with this email already exists");
        }

        const user = await userRepository.create({ name, email, password, phone, role: resolvedRole });

        if (resolvedRole === "rider") {
            await Rider.create({
                user: user._id,
                name: user.name,
                phone: user.phone,
            });
        }

        return { success: true, message: "Registration successful. Please log in." };
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email, true);

        /*
         * One generic message and one comparison for both failure modes. The
         * previous version short-circuited on a missing user, which combined
         * with the (then unlimited) request rate made account enumeration free.
         */
        const passwordMatches = user
            ? await user.matchPassword(password)
            : await bcrypt.compare(password, DUMMY_HASH);

        if (!user || !passwordMatches) {
            throw new ApiError(401, "Invalid email or password");
        }

        let restaurantId = null;
        if (user.role === "restaurant_admin") {
            const restaurant = await Restaurant.findOne({ owner: user._id }).select("_id").lean();
            restaurantId = restaurant ? restaurant._id.toString() : null;
        }

        return {
            success: true,
            token: signToken(user._id, { role: user.role }),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role,
                favorites: user.favorites ?? [],
                restaurantId,
            },
        };
    }

    /**
     * Starts a password reset.
     *
     * Always reports success. Answering 404 for an unknown address — as this did
     * previously — turns the endpoint into an account-existence oracle that needs
     * no password guessing at all.
     */
    async forgotPassword(email) {
        const genericResponse = {
            success: true,
            message: "If an account exists for that address, a reset link is on its way.",
        };

        const user = await User.findOne({ email });
        if (!user) return genericResponse;

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Reset your Foodora password",
                // The old copy told the recipient to "make a PUT request to" the
                // URL, which is developer instructions rather than user copy.
                message: `Reset your password using this link (valid for 10 minutes): ${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
                html: `
                    <p>We received a request to reset your Foodora password.</p>
                    <p><a href="${resetUrl}">Choose a new password</a></p>
                    <p>This link expires in 10 minutes. If you did not request it, no action is needed.</p>
                `,
            });
        } catch (error) {
            // Clear the token so a failed send does not leave a live reset
            // credential on the account.
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            console.error("[AuthService] Password reset email failed:", error.message);
            throw new ApiError(502, "We could not send the reset email. Please try again later.");
        }

        return genericResponse;
    }

    async resetPassword(resetToken, newPassword) {
        const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select("+password");

        if (!user) {
            throw new ApiError(400, "This reset link is invalid or has expired");
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // No token is returned. Auto-signing-in from a link delivered by email
        // means anyone who can read the mailbox — or intercept the link in a
        // referrer header — lands in an authenticated session.
        return { success: true, message: "Password updated. Please log in with your new password." };
    }

    /** Signed-in password change; requires the current password. */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId).select("+password");
        if (!user) throw new ApiError(404, "User not found");

        if (!(await user.matchPassword(currentPassword))) {
            throw new ApiError(401, "Your current password is incorrect");
        }

        user.password = newPassword;
        await user.save();

        return { success: true, message: "Password updated successfully" };
    }
}

module.exports = new AuthService();
