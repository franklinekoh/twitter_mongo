const redisClient = require('../../cache/redis');
const config = require('../config');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const User = mongoose.model('User');

/**
 * get user timeline
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Json|Promise<any>>}
 */
module.exports.get = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const size = req.query.size || 100;
        const offset = (page-1) * page;
        const limit = size;

        redisClient.get(config.redis.keys.getTimeline+':'+req.payload.id, async (err, data) => {
            if (!data) {
                const user = await User.findById(req.payload.id);
                const followingId = user.following; //get followed ids and use to get their post to display

                followingId.push(req.payload.id); //also pass users id into array since user sees
                // // their posts own on their timeline too. other algorithms In my opinion, e.g "like" can also be
                // // implemented using this concept

                const post = await Post.find({
                    author: { $in: followingId}
                }).populate('uploads')
                    .sort({createdAt: 'desc'})
                    .limit(limit)
                    .skip(offset);

                redisClient.set(config.redis.keys.getTimeline +':'+req.payload.id, JSON.stringify(post), 'EX', config.redis.exp);
                return  res.json({data: post});
            }else {
                return  res.json({data: JSON.parse(data)});
            }

        });

    }catch (e) {
        next(e);
    }
};