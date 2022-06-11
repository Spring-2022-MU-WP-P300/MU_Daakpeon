const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const router = express.Router();

// Load Profile Model
const Profie = require('../../models/Profile');

// Load User Profile
const User = require('../../models/User');

router.get('/test', (req, res) => res.json({ msg: 'Profile Works' }));
module.exports = router;
