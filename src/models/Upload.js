const mongoose = require('mongoose');

const UploadSchema = mongoose.Schema({
    upload_path: {type: String, require: [true, 'can"t be blank']}
}, {timestamps: true, versionKey: false});

mongoose.model('Upload', UploadSchema);