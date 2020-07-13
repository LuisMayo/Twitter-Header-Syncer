import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Twitter from 'twitter';
const imageToBase64 = require('image-to-base64');

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
exports.scheduledUpdate = functions.pubsub.schedule('every 24 hours').onRun((ctx) => {
  db.collection('twusers').get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        UpdateBanner(doc);
      });
    }).catch(e => {
      console.error(e);
    });
});
function UpdateBanner(doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) {
  const client = new Twitter({
    consumer_key: process.env.consumer_key as string,
    consumer_secret: process.env.consumer_secret as string,
    access_token_key: doc.get('userToken'),
    access_token_secret: doc.get('userTokenSecret')
  });
  imageToBase64(doc.get('url')).then((string: string) => client.post('account/update_profile_banner', { banner: string }))
    .catch((e: Error) => console.error(e));
}
