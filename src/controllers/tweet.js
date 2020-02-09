const redisClient = require('../../cache/redis');
const config = require('../config');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const Upload = mongoose.model('Upload');
const User = mongoose.model('User');
const Reply = mongoose.model('Reply');

/**
 * post tweet endpoint
 * 
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Json|Promise<any>>}
 */
module.exports.post = async (req, res, next) => {
    try {
        if (!req.body.body && req.files.length === 0)
            return res.status(422).json({'message': 'body or photos is required'});

        let uploadIds = [];

        for (let i = 0; i < req.files.length; i++){
            const value = req.files[i];
            const uploadPath = 'uploads/posts/'+value.filename;
            const upload = await Upload.create({
                upload_path: uploadPath
            });
            uploadIds.push(upload);
        }

        const post = new Post({
            ...req.body,
            author: req.payload.id,
        });
        post.upload(uploadIds);
        await post.save();

        return res.status(201).json({'message': 'post creation completed'});
    }catch (e) {
        next(e);
    }

};

/**
 * Reply tweet endpoint
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Json|Promise<any>>}
 */
module.exports.reply = async (req, res, next) => {
    try {
        const body = req.body.body;
        const post_id = req.body.post_id;
        const files = req.files;

        if (!post_id)
            return res.status(422).json({'message': 'post_id is required'});

        if (!body && files === 0)
            return res.status(422).json({'message': 'body or photos is required'});

        let uploadIds = [];

        for (let i = 0; i < files.length; i++){
            const value = files[i];
            const uploadPath = 'uploads/posts/'+value.filename;
            const upload = await Upload.create({
                upload_path: uploadPath
            });
            uploadIds.push(upload);
        }

        const post = new Post({ //create a new post. a reply is also a post on twitter
            body,
            author: req.payload.id,
        });
        post.upload(uploadIds);

        const reply = new Reply({
            body,
            author: req.payload.id,
            post: post_id,
        });
        reply.upload(uploadIds);

        await Promise.all([
            post.save(),
            reply.save()
        ]);

        return res.status(201).json({'message': 'reply creation completed'});
    }catch (e) {
        next(e);
    }
};

/**
 * Search endpoint
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|Json|Chai.Assertion|Promise<any>>}
 */
module.exports.search = async (req, res, next) => {
        try {
            const q = req.query.q;
            const type = req.query.type; //twitter ui separates search result into different
            // categories (top,latest,people,photos etc.). I felt it was ok
            // separate this search into two cat. users and tweets
            const page = req.query.page || 1;
            const size = req.query.size || 100;
            const offset = (page-1) * page;
            const limit = size;
            const regexQuery = `.*${q}.*`;
            var data;

            if (type === 'users') {
                redisClient.get(config.redis.keys.getSearchUser, async (error, result) => {
                    if (!result){
                        data = await User.find(
                            {
                            $or: [
                                {email:  {$regex: new RegExp(regexQuery, 'i')}},
                                {username: {$regex: new RegExp(regexQuery, 'i')}},
                                {phone: {$regex: new RegExp(regexQuery, 'i')}}
                            ]
                        }
                        )
                            .sort({createdAt: 'desc'})
                            .limit(limit)
                            .skip(offset);

                        redisClient.set(config.redis.keys.getSearchUser, JSON.stringify(data), 'EX', config.redis.exp);
                    } else {
                        data = JSON.parse(result);
                    }

                    return res.json({data: data});
                });

            }

            if (type === 'tweets') {
                redisClient.get(config.redis.keys.getSearchTweet, async (error, result) => {
                    if (!result){
                        data = await Post.find({
                            body: {$regex: new RegExp(regexQuery, 'i')}
                        }).populate('uploads')
                            .sort({createdAt: 'desc'})
                            .limit(limit)
                            .skip(offset);
                        redisClient.set(config.redis.keys.getSearchTweet, JSON.stringify(data), 'EX', config.redis.exp);
                    } else {
                        data = JSON.parse(result);
                    }
                    return res.json({data: data});
                });
            }

        }catch (e) {
            next(e);
        }
};