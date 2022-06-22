const express = require('express');
const passport = require('passport');

const router = express.Router();

// Load Validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }

            return res.json(profile);
        })
        .catch((err) => res.status(404).json(err));
});
router.get('/all', (req, res) => {
    const errors = {};

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then((profiles) => {
            if (!profiles) {
                errors.noprofile = 'There are no profiles';
                return res.status(404).json(errors);
            }
            return res.json(profiles);
        })
        .catch((err) => res.status(404).json({ profile: 'There are no profiles' }));
});
router.get('/handle/:handle', (req, res) => {
    const errors = {};

    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch((err) => res.status(404).json(err));
});
router.get('/user/:user_id', (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch((err) => res.status(404).json({ profile: 'There is no profile for this user' }));
});

// eslint-disable-next-line consistent-return
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {
        handle,
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        linkedin,
        facebook,
        instagram,
    } = req.body;

    const { errors, isValid } = validateProfileInput({
        handle,
        website,
        status,
        skills,
        youtube,
        twitter,
        linkedin,
        facebook,
        instagram,
    });

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const profileFields = {};

    profileFields.user = req.user.id;
    if (handle) profileFields.handle = handle;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    // Skills - Split into array
    if (typeof skills !== 'undefined') {
        profileFields.skills = skills.split(',');
    }

    // Social
    profileFields.social = {};

    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;

    Profile.findOne({ user: req.user.id }).then((profile) => {
        if (profile) {
            // Update
            Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true },
            ).then((profile) => res.json(profile));
        } else {
            // Create
            // Check if handle exists
            Profile.findOne({ handle: profileFields.handle }).then((profile) => {
                if (profile) {
                    errors.handle = 'That handle already exists';
                    res.status(400).json(errors);
                }
                // Save Profile
                new Profile(profileFields).save().then((profile) => res.json(profile));
            });
        }
    });
});

// eslint-disable-next-line consistent-return
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
        // eslint-disable-next-line object-curly-newline
        const { title, company, location, from, to, current, description } = req.body;

        const { errors, isValid } = validateExperienceInput({ title, company, from });

        if (!isValid) {
            return res.status(400).json(errors);
        }

        const newExperience = {
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        };
        // Add to Experience Array
        profile.experience.unshift(newExperience);

        profile.save().then((profile) => res.json(profile));
    });
});
// eslint-disable-next-line consistent-return
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id }).then((profile) => {
        // eslint-disable-next-line object-curly-newline
        const { school, degree, fieldofstudy, from, to, current, description } = req.body;

        const { errors, isValid } = validateEducationInput({
            school,
            degree,
            fieldofstudy,
            from,
        });

        if (!isValid) {
            return res.status(400).json(errors);
        }

        const newEducation = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description,
        };
        // Add to Experience Array
        profile.education.unshift(newEducation);

        profile.save().then((profile) => res.json(profile));
    });
});
router.delete(
    '/experience/:exp_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then((profile) => {
                const removeIndex = profile.experience
                    .map((item) => item.id)
                    .indexOf(req.params.exp_id);
                profile.experience.splice(removeIndex, 1);
                profile.save().then((profile) => res.json(profile));
            })
            .catch((err) => res.status(404).json(err));
    },
);
router.delete(
    '/education/:edu_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then((profile) => {
                const removeIndex = profile.education
                    .map((item) => item.id)
                    .indexOf(req.params.edu_id);
                profile.education.splice(removeIndex, 1);
                profile.save().then((profile) => res.json(profile));
            })
            .catch((err) => res.status(404).json(err));
    }
);

router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() => res.json({ success: true }));
    });
});

module.exports = router;
