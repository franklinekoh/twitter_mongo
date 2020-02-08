const mongoose = require('mongoose');

const ReplySchema = mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    body: String,
    uploads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Upload' }]
}, {timestamps: true});

ReplySchema.methods.upload = function(array){
    this.uploads = this.uploads.concat(array);
};

mongoose.model('Reply', ReplySchema);