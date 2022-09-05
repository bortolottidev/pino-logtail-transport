# pino-logtail-transport
Just another Pino transport.. But for Logtail!

A [Transport](https://getpino.io/#/docs/transports) to send logs to [Logtail Platform](https://logtail.com/).

## Installation

```
npm i pino-logtail-transport
```

## Usage

### Basic Usage

Use the transport as destination

```js
  const pino = require("pino");

  const logtailTransport = pino.transport({
    target: 'pino-logtail-transport',
    options: {
      debug: true,
      logtailToken: process.env.LOGTAIL_AUTH_TOKEN,
    },
  });
  
  const logger = pino(logtailTransport);
  
  logger.info("Hello, Logtail!");
```

### Multistream usage

Both log on stdout and logtail

```js
const pino = require("pino");


const stdoutTransport = pino.transport({
  target: 'pino/file',
  options: { destination: 1 },
});

  const logtailTransport = pino.transport({
    target: 'pino-logtail-transport',
    options: {
      logtailToken: process.env.LOGTAIL_AUTH_TOKEN,
    },
  });
  
const logger = pino({
    level: "info",
  },
  pino.multistream([
    stdoutTransport,
    logtailTransport
  ]),
);
  
  logger.info("Hello, Logtail!");;

```

## Options

- `logtailToken` (REQUIRED) auth token, provided by logtail platform
- `debug` (OPTIONAL) flag that trigger the _rawDebug() log (useful when debugging the transport)

