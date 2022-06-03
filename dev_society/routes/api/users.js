const express = require('express');

const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const res = require('express/lib/response');
const keys = require('../../config/keys');

// Load User Model
const User = require('../../models/User');

router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    User.findOne({ email }).then((user) => {
        if (user) {
            return res.status(400).json({ email: 'Email already exists' });
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

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email }).then((user) => {
        if (!user) {
            res.status(404).json({ email: 'User not found' });
        }

        bcrypt.compare(password, user.password).then((isMatch) => {
            if (isMatch) {
                const payload = { id: user.id, name: user.name, avatar: user.avatar };

                jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                    res.json({
                        success: true,
                        token: `Bearer ${token}`,
                    });
                });
            } else {
                return res.status(400).json({ password: 'Password incorrect' });
            }
        });
    });
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { id, name, email } = req.user;
    res.json({ id, name, email });
});

module.exports = router;
