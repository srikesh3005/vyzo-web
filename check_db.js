require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const key = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(key)
});
const db = admin.firestore();
async function run() {
  const query = await db.collection('products').where('asin', '==', 'B0F7Y54PJX').get();
  if (query.empty) {
    console.log("Not found in db!");
  } else {
    query.forEach(doc => console.log(JSON.stringify(doc.data(), null, 2)));
  }
}
run();
