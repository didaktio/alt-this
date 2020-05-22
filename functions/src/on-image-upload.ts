import * as functions from 'firebase-functions';
import Vision = require('@google-cloud/vision');

const vision = new Vision.v1p4beta1.ImageAnnotatorClient();

export const genAltText = functions.https.onCall(
    async ({ filename }, context) =>
        (await vision.labelDetection({ image: { source: { imageUri: `gs://alt-this.appspot.com/uploadedImages/${filename}` } as any } }))[0].labelAnnotations
);