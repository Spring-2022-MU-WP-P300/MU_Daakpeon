/* eslint-disable no-param-reassign */
const Validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateExperienceInput({ title, company, from }) {
    const errors = {};
    // eslint-disable-next-line object-curly-newline

    title = !isEmpty(title) ? title : '';
    company = !isEmpty(company) ? company : '';
    from = !isEmpty(from) ? from : '';

    if (Validator.isEmpty(title)) {
        errors.title = 'Job title field is required';
    }
    if (Validator.isEmpty(company)) {
        errors.company = 'company field is required';
    }
    if (Validator.isEmpty(from)) {
        errors.from = 'From date field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
};
