const Joi = require('@hapi/joi');

const follow = {
    create: Joi.object().keys({
        followed_id: Joi.string().required()
    })
};

module.exports = follow;