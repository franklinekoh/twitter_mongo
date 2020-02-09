const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    body: String,
    uploads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Upload' }]
}, {timestamps: true, versionKey: false});

PostSchema.methods.upload = function(array){
    this.uploads = this.uploads.concat(array);
};

mongoose.model('Post', PostSchema);