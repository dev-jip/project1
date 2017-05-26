process.env.TZ = 'Asia/Seoul';
const express = require('express');
const app = global.app = express();
const bodyParser = require('body-parser');

global._ = require('../../www/share/partial.js');


const path = global.path = require('path');
const moment = global.moment = require('moment-timezone');
// const s3 = global.s3 = new AWS.S3();

// app.js = {};

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
require('../all/db/connection');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(require('stylus').middleware(path.resolve(__dirname, '../../www')));
app.use(express.static(path.resolve(__dirname, '../../www')));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.locals.layout = false;
// require('../all/db/partial_pg');
// require('../all/db/scheme');
require('./db/partial_pg');
require('./db/scheme');
// app.get('/good', function(req, res) {
//   res.send('nice')
// });
//
// app.listen(3000, function(){
//   console.log('connected')
// })

// var DynamoDBStore = require('dynamodb-session-store')(session);

var options = {
  tableName: 'jip_redis',
  consistentRead: false,
  accessKeyId: 'AKIAIMI3SMNUAPKVMTDQ',
  secretAccessKey: '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',
  region: 'ap-northeast-2'
};

app.use(session({
  store: new RedisStore ({
    host: 'localhost',
    port: 6379
  }),
  secret: 'adsfsdf',
  resave: true,
  saveUninitialized: false
  ,
  cookie: {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 3600000 * 24 * 7),
    maxAge: 3600000 * 24 * 7
  }
}));


const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
aws.config.region = 'ap-northeast-2';
aws.config.update({
  accessKeyId: "AKIAIMI3SMNUAPKVMTDQ",
  secretAccessKey: "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"
});
const s3 = new aws.S3()

global.upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'iamami.aws.jip',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
})