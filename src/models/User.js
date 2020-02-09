const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const UserSchema = new mongoose.Schema({
    name: {type: String, require: [true, 'can"t be blank']},
    email: {type: String, lowercase: true, unique: true, require: [true, 'can"t be blank'], index: true},
    bio: String,
    phone: {type: String, require: [true, 'can"t be blank'], unique: true, index: true},
    username: {type: String, require: [true, 'can"t be blank'], unique: true, index: true},
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    password: {type: String, select: false, require: [true, 'can"t be blank']}
}, {timestamps: true, versionKey: false});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.methods.setPassword = function(password){
    this.password = bcrypt.hashSync(password, 10)
};

UserSchema.methods.validatePassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.follow = function(id){
    if(this.following.indexOf(id) === -1){
        this.following = this.following.concat([id]);
    }
    return this.save();
};

UserSchema.methods.generateJWT = function() {
    return jwt.sign({
        id: this._id,
        username: this.username,
        expiresIn: config.auth.exp
    }, config.secret);
};

UserSchema.methods.toAuthJson = function(){
    return {
        token: this.generateJWT(),
        name: this.name,
        email: this.email,
        bio: this.bio,
        phone: this.phone,
        username: this.username
    };
};

mongoose.model('User', UserSchema);