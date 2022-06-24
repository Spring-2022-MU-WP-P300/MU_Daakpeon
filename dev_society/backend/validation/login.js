/* eslint-disable no-param-reassign */
const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateLoginInput({ email, password }) {
    const errors = {};
    // eslint-disable-next-line object-curly-newline

    email = !isEmpty(email) ? email : '';
    password = !isEmpty(password) ? password : '';

    if (Validator.isEmpty(email)) {
        errors.email = 'Name field is required';
    }
    if (!Validator.isEmail(email)) {
        errors.email = 'Email is invalid';
    }
    if (Validator.isEmpty(password)) {
        errors.password = 'Password field is required';
    }
    if (!Validator.isLength(password, { min: 6, max: 30 })) {
        errors.password = 'Password must be at least 6 characters';
    }
    return {
        errors,
        isValid: isEmpty(errors),
    };
};
