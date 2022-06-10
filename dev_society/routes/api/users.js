const express = require('express');

const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
// const res = require('express/lib/response');
const keys = require('../../config/keys');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User Model
const User = require('../../models/User');

// eslint-disable-next-line no-shadow
// eslint-disable-next-line consistent-return
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const { name, email, password } = req.body;

    // eslint-disable-next-line consistent-return
    User.findOne({ email }).then((user) => {
        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        }
        const avatar = gravatar.url(email, {
            s: '200', // Size
            r: 'pg', // Rating
            d: 'mm', // Default
        });

        const newUser = new User({
            name,
            email,
            avatar,
            password,
        });

        bcrypt.genSalt(10, (err, salt) => {
            // eslint-disable-next-line no-shadow
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                    .save()
                    // eslint-disable-next-line no-shadow
                    .then((user) => res.json(user))
                    // eslint-disable-next-line no-shadow
                    .catch((err) => console.log(err));
            });
        });
    });
});

// eslint-disable-next-line no-shadow
// eslint-disable-next-line consistent-return
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }
    const { email, password } = req.body;

    User.findOne({ email }).then((user) => {
        if (!user) {
            errors.email = 'User not found';
            res.status(404).json(errors);
        }
        // eslint-disable-next-line consistent-return
        bcrypt.compare(password, user.password).then((isMatch) => {
            if (isMatch) {
                const { id, name, avatar } = user;
                const payload = { id, name, avatar };

                jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                    res.json({
                        success: true,
                        token: `Bearer ${token}`,
                    });
                });
            } else {
                errors.password = 'Password incorrect';
                return res.status(400).json(errors);
            }
        });
    });
});
// eslint-disable-next-line no-shadow
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { id, name, email } = req.user;
    res.json({ id, name, email });
});

module.exports = router;
