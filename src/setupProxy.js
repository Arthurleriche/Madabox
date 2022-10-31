const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/auth/**',
    createProxyMiddleware({
      target:
        'https://us-central1-madabox-972.cloudfunctions.net/spotify_server',
    })
  );
};
