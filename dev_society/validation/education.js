/* eslint-disable no-param-reassign */
const Validator = require('validator');
const isEmpty = require('./isEmpty');

// eslint-disable-next-line object-curly-newline
module.exports = function validateExperienceInput({ school, degree, fieldofstudy, from }) {
    const errors = {};

    school = !isEmpty(school) ? school : '';
    degree = !isEmpty(degree) ? degree : '';
    fieldofstudy = !isEmpty(fieldofstudy) ? fieldofstudy : '';
    from = !isEmpty(from) ? from : '';

    if (Validator.isEmpty(school)) {
        errors.school = 'School field is required';
    }
    if (Validator.isEmpty(degree)) {
        errors.degree = 'Degree field is required';
    }
    if (Validator.isEmpty(fieldofstudy)) {
        errors.fieldofstudy = 'Field of study field is required';
    }
    if (Validator.isEmpty(from)) {
        errors.from = 'From date field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors),
    };
};
