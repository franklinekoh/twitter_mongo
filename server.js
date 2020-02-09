const express = require('express');
const app = express();
const cors = require('cors');
const errorhandler = require('errorhandler');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./doc/swagger');
const mongoose = require('mongoose');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';


app.use(express.static('public'));
/**
 * Cors
 */
app.use(cors());
/**
 * JSON and urlencoded body parser
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true, limit: '10mb'}));

if (!isProduction) {
    app.use(errorhandler({ log: true }));
};

// Mongo DB connection
if(isProduction){
    mongoose.connect(process.env.MONGO_PROD_URI, { useCreateIndex: true }).then(() => {

    });
} else {
    mongoose.connect(process.env.MONGO_DEV_URI, { useCreateIndex: true }).then(() => {

    }).catch((error) => {
        console.log(error)
    });
    mongoose.set('debug', true);
}

// MongoDB Models
require('./src/models/User');
require('./src/models/Post');
require('./src/models/Upload');
require('./src/models/Reply');

/**
 *  Routes
 */
const authRoute = require('./src/routes/auth');
const tweetRoute = require('./src/routes/tweet');
const followRoute = require('./src/routes/follow');
const timelineRoute = require('./src/routes/timeline');

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/tweet', tweetRoute);
app.use('/api/v1/follow', followRoute);
app.use('/api/v1/timeline', timelineRoute);

/**
 * documentation
 */
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//  Mongoose Validation Error
app.use(function(err, req, res, next){
    if(err.name === 'ValidationError'){
        return res.status(422).json({
            errors: Object.keys(err.errors).reduce(function(errors, key){
                errors[key] = err.errors[key].message;

                return errors;
            }, {})
        });
    }

    return next(err);
});

// development error handler
// will print stacktrace
if (!isProduction) {
    app.use(function(err, req, res, next) {
        console.log(err.stack);
        res.status(err.status || 500);

        res.json({'errors': {
                message: err.message,
                error: err
            }});
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({'errors': {
            message: err.message,
            error: {}
        }});
});

const server = app.listen( process.env.PORT || 5000, function(){
    console.log('Listening on port ' + server.address().port);
});

module.exports = server;
