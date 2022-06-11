const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const router = express.Router();

// Load Profile Model
const Profile = require('../../models/Profile');

// Load User Profile
const User = require('../../models/User');

router.get('/test', (req, res) => res.json({ msg: 'Profile Works' }));

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            if (!profile) {
                errors.noprofile = 'Profile does not exist';
                return res.status(404).json(errors);
            }
            return res.status(200).json(profile);
        })
        .catch((err) => res.status(404).json(err));
});

module.exports = router;
