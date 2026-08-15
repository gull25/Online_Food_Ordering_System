const { z } = require("zod");
const { email, password, phone, safeText } = require("./common.validation");

/*
 * `role` is accepted — the signup form has an "Account type" selector — but only
 * from a closed set.
 *
 * Registration previously read `userData.role || 'customer'` while the validate
 * middleware threw its parsed output away, so *any* string reached the model.
 * A request carrying `{"role":"admin"}` created a platform administrator, which
 * unlocks cross-restaurant order listings and the customer-email CSV export.
 * The enum is enforced twice — here and in the service — because this schema is
 * the kind of thing that gets relaxed later without anyone re-checking the
 * service.
 */

const registerSchema = z.object({
    name: safeText(80, "Name").pipe(z.string().min(2, "Name must be at least 2 characters")),
    email,
    password,
    phone: phone.optional(),
    role: z.enum(["customer", "restaurant_admin", "rider"]).default("customer"),
});

const loginSchema = z.object({
    email,
    // No strength rules on login — they would leak the password policy and
    // reject legacy passwords that are still valid.
    password: z.string().min(1, "Password is required").max(128),
});

const forgotPasswordSchema = z.object({ email });

const resetPasswordSchema = {
    params: z.object({
        token: z
            .string()
            .trim()
            .regex(/^[a-f\d]{40}$/i, "Invalid or malformed reset token"),
    }),
    body: z.object({ password }),
};

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required").max(128),
    newPassword: password,
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
};
