const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/*
 * bcrypt cost. 10 was the old value; 12 is the current baseline for a password
 * hash that has to stand up to offline cracking on commodity GPUs. It costs
 * roughly 200ms per login, which is acceptable for an operation that happens
 * once per session and is now rate limited.
 */
const BCRYPT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
            maxlength: [80, 'Name cannot be more than 80 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            // Without `lowercase`, "User@x.com" and "user@x.com" were two
            // distinct accounts as far as the unique index was concerned, while
            // the login lookup was case-sensitive — so an address registered with
            // a capital could never be signed into from a lowercase form.
            lowercase: true,
            trim: true,
            maxlength: 254,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                'Please add a valid email',
            ],
        },
        phone: {
            type: String,
            trim: true,
            maxlength: 20,
            default: '',
        },
        avatar: {
            type: String,
            default: '',
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 8,
            select: false,
        },
        role: {
            type: String,
            // `admin` is recognised by the authorisation layer and grants
            // platform-wide access; it is listed here so such an account can
            // exist, but it is not reachable through registration.
            enum: ['customer', 'restaurant_admin', 'rider', 'admin'],
            default: 'customer',
        },
        restaurantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
        },
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Restaurant',
            },
        ],
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpire: { type: Date, select: false },
    },
    {
        timestamps: true,
    }
);

userSchema.index({ role: 1 });
userSchema.index({ restaurantId: 1 }, { sparse: true });
// Password reset looks the token up directly; without this it was a full scan.
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    // `this.password` is undefined unless the caller selected it; comparing
    // against undefined throws inside bcrypt rather than returning false.
    if (!this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
};

/** Issues a reset token, storing only its hash. */
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
