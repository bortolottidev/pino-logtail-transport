const pino = require("pino");

const logtailTransport = pino.transport({
  target: __dirname + '/index.js',
  options: {
    debug: true,
    logtailToken: process.env.LOGTAIL_AUTH_TOKEN,
  },
});

const logger = pino(logtailTransport);

logger.info("Hello, Logtail!");
