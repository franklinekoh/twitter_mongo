const mongoose = require('mongoose');
const User = mongoose.model('User');

/**
 * Registration endpoint
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Json|Promise<any>>}
 */
module.exports.register = async (req, res, next) => {
        try {

            let user = new User(req.body);
            user.setPassword(req.body.password);

            await user.save();
            return res.status(201).json({user: user.toAuthJson()});
        }catch (e) {
            next(e);
        }
};

/**
 * Login endpoint
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Json|Promise<any>>}
 */
module.exports.login = async (req, res, next) => {
        try {
            const user_id = req.body.user_id;
            const password = req.body.password;

            const user = await User.findOne({
                    $or: [
                        {email: user_id},
                        {username: user_id},
                        {phone: user_id}
                    ]
            }).select('+password');
           if (!user) return res.status(401).json({'message': 'incorrect credentials'});

           if (!user.validatePassword(password))
               res.status(401).json({'message': 'incorrect credentials'});

               res.json({user: user.toAuthJson()});
        }catch (e) {
            next(e);
        }
};

