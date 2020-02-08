const mongoose = require('mongoose');
const User = mongoose.model('User');
/**
 * Follow User
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
module.exports.create = async (req, res, next) => {
    try {
        const followed_id = req.body.followed_id;
        const follower_id = req.payload.id;
        if (followed_id === follower_id)
            return res.status(403).json({'message': 'Unauthorized: cannot follow self'});

        const user = await User.findById(follower_id);
        await user.follow(followed_id);

        return res.status(201).json({'message': 'follow successful'});
    }catch (e) {
        next(e);
    }
};