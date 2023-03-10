// /* eslint-disable no-unused-vars */
const functions = require('firebase-functions');
const request = require('request');

const express = require('express');
const cors = require('cors');

const app = express();

global.access_token = '';
let clientId = '';
let clientSecret = '';

const local = false;

var allowlist = ['http://localhost:3000', 'https://madabox-972.web.app'];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

let spotify_redirect_uri;

if (local) {
  spotify_redirect_uri =
    'http://localhost:5001/madabox-972/us-central1/spotify_server/auth/callback';
} else {
  spotify_redirect_uri =
    'https://us-central1-madabox-972.cloudfunctions.net/spotify_server/auth/callback';
}

var generateRandomString = function (length) {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.get('/auth/login', cors(corsOptionsDelegate), (req, res) => {
  var scope =
    'user-modify-playback-state user-read-playback-state user-read-private user-read-email streaming user-library-read playlist-modify-public playlist-modify-private playlist-read-collaborative';
  var state = generateRandomString(16);
  clientId = req.query.client_id;
  clientSecret = req.query.client_secret;

  var auth_query_parameters = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state,
  });

  res.redirect(
    'https://accounts.spotify.com/authorize/?' +
      auth_query_parameters.toString()
  );
});

app.get('/auth/callback', cors(corsOptionsDelegate), (req, res) => {
  console.log('auth/callback');
  var code = req.query.code;
  console.log(req.query);

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: 'authorization_code',
    },
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      // eslint-disable-next-line no-undef
      access_token = body.access_token;
      // eslint-disable-next-line no-undef
      refresh_token = body.refresh_token;
      if (local) {
        res.redirect(
          `http://localhost:3000/home?access_token=${body.access_token}&refresh_token=${body.refresh_token}`
        );
      } else {
        res.redirect(
          `https://madabox-972.web.app/home?access_token=${body.access_token}&refresh_token=${body.refresh_token}`
        );
      }
    }
  });
});

app.get('/auth/token', cors(corsOptionsDelegate), (req, res) => {
  if (local) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://madabox-972.web.app');
  }
  // eslint-disable-next-line no-undef
  res.json({ access_token: access_token, refresh_token: refresh_token });
});

exports.spotify_server = functions.https.onRequest(app);
