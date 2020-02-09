const assert = require('assert');
const mongoose = require('mongoose');
const User = mongoose.model('User');

require('mocha');

describe('User model functions', () => {
    it('should return true if password is valid', async function () {
        const user = await User.findOne({
            $or: [
                {email: 'ekohfranklin@gmail.com'},
                {username: 'my user id'},
                {phone: '081...'}
            ]
        }).select('+password');

        assert.equal(user.validatePassword('Mskskd787'), true);
    });

    it('should return false if password is wrong', async function () {
        const user = await User.findOne({
            $or: [
                {email: 'wrong email'},
                {username: '@thefrank'},
                {phone: 'but correct username'}
            ]
        }).select('+password');

        assert.equal(user.validatePassword('this is a wrong password'), false);
    });

    it('should return string jwt is generated', async function () {
        const user = await User.findOne({
            $or: [
                {email: 'wrong email'},
                {username: '@thefrank'},
                {phone: 'but correct username'}
            ]
        });

        assert.ok(typeof user.generateJWT() === 'string');
    });

    it('should return object with properties', async function () {
        const user = await User.findOne({
            $or: [
                {email: 'wrong email'},
                {username: '@thefrank'},
                {phone: 'but correct username'}
            ]
        });

        assert.ok(typeof user.toAuthJson() === 'object');
        assert.ok(user.toAuthJson().should.have.property('token'));
        assert.ok(user.toAuthJson().should.have.property('name'));
        assert.ok(user.toAuthJson().should.have.property('email'));
        assert.ok(user.toAuthJson().should.have.property('bio'));
        assert.ok(user.toAuthJson().should.have.property('phone'));
        assert.ok(user.toAuthJson().should.have.property('username'));
    });

});