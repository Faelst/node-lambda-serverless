'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const sharp = require('sharp');
const { basename, extname } = require('path');
const firebaseAdmin = require('firebase-admin');
require('dotenv').config();

module.exports.hello = async (event) => ({
  statusCode: 200,
  body: JSON.stringify(
    {
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    },
    null,
    2
  ),
});

// module.exports.handle = async ({ Records: records }, context) => {
//   try {
//     await Promise.all(
//       records.map(async (record) => {
//         const { key } = record.s3.object;

//         const image = await S3.getObject({
//           Bucket: process.env.bucket,
//           Key: key,
//         }).promise();

//         const optimized = await sharp(image.Body)
//           .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
//           .toFormat('jpeg', { progressive: true, quality: 50 })
//           .toBuffer();

//         await S3.putObject({
//           Body: optimized,
//           Bucket: process.env.bucket,
//           ContentType: 'image/jpeg',
//           Key: `compressed/${basename(key, extname(key))}`,
//         }).promise();
//       })
//     );

//     return {
//       statusCode: 301,
//     };
//   } catch (err) {
//     console.log(err);
//   }
// };

module.exports.firebaseAuth = async (event) => {
  const decode64 = (value) => {
    const buffer = Buffer.from(value, 'base64');

    return buffer.toString();
  };

  const firebaseAppInstance = () => {
    const {
      FIREBASE_DB_URL,
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY,
    } = process.env;

    const privateKey = decode64(FIREBASE_PRIVATE_KEY || '');

    const config = {
      credential: firebaseAdmin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      databaseURL: FIREBASE_DB_URL,
    };

    return firebaseAdmin.initializeApp(config);
  };

  try {
    const firebase = firebaseAppInstance();
    const Auth = firebase.auth();
    const request = event;
    const authHeader = request.headers.Authorization;
    const token = authHeader.split(' ')[1];
    const decodedToken = await Auth.verifyIdToken(token);

    return {
      statusCode: 200,
      body: JSON.stringify(decodedToken),
    };
  } catch (err) {
    console.log(err);
  }
};
