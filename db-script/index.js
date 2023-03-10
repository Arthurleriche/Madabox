const admin = require('firebase-admin');
const populate = require('./populate.json');
const generateMustache = require('./generate-session.js');
require('dotenv').config();
console.log('db');
const local = true;

const adminUidsArr = [];
const userUidsArr = [];

if (local) {
  console.log('Populating local db');

  process.env['FIRESTORE_EMULATOR_HOST'] = '127.0.0.1:8080';
  process.env['FIREBASE_AUTH_EMULATOR_HOST'] = '127.0.0.1:9099';

  admin.initializeApp({ projectId: 'madabox-972' });

  run();
} else {
  const cred = {
    type: 'service_account',
    project_id: 'madabox-972',
    private_key_id: '4e1a55f31fe850f190756a9b870e88afae2c2448',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNjpFyHhDA6BcW\n0DlwMYRLvVCEG/ZQnQBywSNvkLess2RGl5fT+TirR4N8fWhC1wRSd1OCEpfDExmZ\n8I/hGS9AzOEC3VjiozsHCLFONfWTc0UHXeQ6VFVwKnzpQuuw7fcu27+OZPgZFLWF\n5CUwwBJNDnrltHPtYliKcjIPOr8r7cSdBx5U++EAACp2M65uBR/UqY+2PcjKIjzF\nHUIkCaF9os0PKMW6sJo6ePPt+VDsyiYbqLMd109S2vXLOVhhh6qIa+NbV0HR4u2h\nD416kXNUOKqcUlbASVTUSJQ+fm6Cgmm0GKnnwHBOsKHeS9PKBQcB8riO3A4pr9/u\n80aUZ8uXAgMBAAECggEACRW6fukuQ2BemN8GEtvVZYWN9/DGb6SovumjV8x1Gbhp\n/6a2iqNSqltER+3A/GdFZSGp+q84ruH6uS+FJGU5DeugLEC9K3McakCrmXHQEz6+\nd8diDWPpzMXL9IFFKnIyAQusSS5UOsOMDElbjW6HwIkZzGovz3ePwzqt1Ld7eIT6\n5AVsaxfnXGjLsZqymRW7/67Cpd1GzKOONZjdW02F7dDh/W/VGVRoP22SqF8Cx62m\nTWv8ee9XQp/SknglXIbI34JR91prtamEG6D5GvjGcz9+5UQbOBsZyWaC91p8EtlY\nfaHk3joQDpdwdrXN1fX7lv1nQ6rpmcuSjnWd3QctxQKBgQDxs7zuK5OwAeDeQC6T\nMzEJhAPWtyFv9wwKSxj+ZxevWh013/SgSnmQ7Mv2+iqGNrCa8nqaY/tJ67vqEZHy\n/JLl12VwoBlMySzMQf54k19BkFlYzyrGor0R8AGyPD8gmRegsCTaO90rkmgsWJEK\nRs4rBRr0EXPIOyeAyKYYj4NglQKBgQDZt3VeS8JjyPJB96z4mmKCGtf7q409vici\nxnYEWl1xVd9Q5FwA7AnSY2O2HmSs3ZGc62AKrh7o0Gv3JoWazm2B+x3qeXOC7MM7\nNd+RFd9jCU015MCkjqY2CC2SsofUIqbmRaF7m+WKlpaVl48qk81Te7dw9kyKoX30\npVYIntnUewKBgCqG0GgrfKnMOs+ABXHa4PbmpnJB+H0lv5WUDwq8AtvUhC01gWou\nkGMiduS2sYK53qr0nQPLMayY8JBHlSFmtUYBdxSw5qKvBtXNisOWUn1Ls5y/nqwi\neBfO3c2JciX/KbwZIfLP86M1+GRNFP/041OIa2ykIXYKinHLXAYYQipdAoGBALYF\nc9MKc9MJRcFxWOPf70vnNXvryYI9YGrqkfDBvC3tJW9z/Jeov+1tuwegEXuVIxCW\nmQ1U1fK/jgRr6Hes7lElqbVHJRPo7rCqMegS6Vjbhfnw7j6mJMA3xiJHsNfiwLb0\nsDWv+RENJYib1c47FAcgABYpVYTxz2SidnNum5/RAoGBAO/zJxLkEYraEq9X0kL/\nSZlbUFIYXoNj24P/+bR8WpYQyO2f8ksVl/qJ+jqDKF1bFEUCdsl+DV4Wpgfu4C4K\nGSWDuNKWq5GtonwtToOn/noUxA3Vr5fepCJH68uC88aB3q+KS0RuPk4YYT7339EN\n0iBZ95TikU1+TEKDfFmGttgM\n-----END PRIVATE KEY-----\n',
    client_email: 'firebase-adminsdk-z3fff@madabox-972.iam.gserviceaccount.com',
    client_id: '118434270543757151811',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-z3fff%40madabox-972.iam.gserviceaccount.com',
  };

  admin.initializeApp({
    credential: admin.credential.cert(cred),
  });

  run();
}

async function createUser(email) {
  let userRecord = await admin.auth().createUser({
    email: email,
    emailVerified: true,
    password: '123abcDEF',
    disabled: false,
  });

  console.log(userRecord);

  return userRecord.uid;
}

async function createProfile(user, id) {
  console.log(`Creating profile:${user.username}`);

  const profile = {
    username: user.username,
    role: user.role,
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    spotify_token: null,
    first_name: user.first_name,
    last_name: user.last_name,
    user_uid: id,
    session_uid: '123456789',
  };

  let docRef = await admin
    .firestore()
    .collection('profiles')
    .doc(id)
    .set(profile);

  return docRef.id;
}

async function createSession(session) {
  console.log(`Creating session for:${session.user_uid}`);

  const sessionTmp = {
    queue_list: session.queueList,
    user_uid: session.user_uid,
    active: false,
    spotify_token: null,
    name: 'Session de Arthur',
    skipNumber: '7',
    password: '123',
    library: [],
    lib: false,
  };

  let docRef = await admin
    .firestore()
    .collection('sessions')
    .doc('123456789')
    .set(sessionTmp);

  return docRef.id;
}

async function run() {
  await Promise.all(
    populate.usersAdmin.map(async (user) => {
      const userRecord = await createUser(user.email);
      await createProfile(user, userRecord);
      adminUidsArr.push(userRecord);
    })
  );
  console.log('✅ admin creation success ✅');
  // création des users auth + profile
  await Promise.all(
    populate.users.map(async (user) => {
      const userRecord = await createUser(user.email);
      await createProfile(user, userRecord);
      userUidsArr.push(userRecord);
    })
  );
  console.log('✅ users creation success ✅');

  // AUTH + PROFILE \\

  // SESSIONS \\
  const sessions = generateMustache.generateSession(adminUidsArr, userUidsArr);
  await Promise.all(
    sessions.sessions.map(async (session) => {
      await createSession(session);
    })
  );
  console.log('✅ sessions creation success ✅');
  // SESSIONS \\

  console.log('✅✅✅✅✅✅✅✅✅ db-script success ✅✅✅✅✅✅✅✅✅');
}
