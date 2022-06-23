/* eslint-disable no-param-reassign */
const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validatePostInput({ text }) {
    const errors = {};
    // eslint-disable-next-line object-curly-newline

    text = !isEmpty(text) ? text : '';

    if (!Validator.isLength(text, { min: 10, max: 300 })) {
        errors.text = 'The post must be between 10 and 300 characters.';
    }
    if (Validator.isEmpty(text)) {
        errors.text = 'Text field is required';
    }
    return {
        errors,
        isValid: isEmpty(errors),
    };
};
