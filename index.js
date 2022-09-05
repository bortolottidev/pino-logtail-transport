const build = require('pino-abstract-transport');
const undici = require('undici');

function defaultParseLine (line) {
  const obj = JSON.parse(line);
  const d = new Date();

  return {
    ...obj,
    logId: Math.floor(Math.random() * 100000),
    time: d.getTime(),
    dt: d.toISOString(),
  };
}

module.exports = async function (options) {

  let batchDataToSend = [];
  let autoFlushTimeout;

  const debugLog = (msg) => {
    if (!options.debug) {
      return;
    }

    process._rawDebug(msg);
  }

  const sendLogsToLogtail = async () => {
    const body = JSON.stringify(batchDataToSend);
    batchDataToSend = [];

    debugLog("Sending: " + body);

    const res = await undici.fetch('https://in.logtail.com', {
      body, 
      method: 'POST', 
      headers: { 
        ['content-type']: 'application/json',
        ['authorization']: `Bearer ${options.logtailToken}`,
      },
    });

    debugLog("Response: " + res.status)

  }

  const send = async (log) => {
    batchDataToSend.push(log);

    // If set, reset flush timeout, we're already trying to send
    if (autoFlushTimeout) {
      clearTimeout(autoFlushTimeout);
    }

    if (batchDataToSend.length >= 10) {
      debugLog("Time to send: " + batchDataToSend.length);
      return sendLogsToLogtail();
    }

    autoFlushTimeout = setTimeout(() => {
      debugLog("Flushing after 1 sec from last send...");
      if (batchDataToSend.length === 0) return;

      const noOp = () => {};
      sendLogsToLogtail().then(noOp);
    }, 1000);

    debugLog("Not time to send: " + batchDataToSend.length);
    return;
  }

  const parseLine = typeof options.parseLine === 'function' ? options.parseLine : defaultParseLine;
  
  if(!options.logtailToken) {
    throw new Error("Missing Logtail Authorization Token!");
  }

  return build(async function (source) {
    for await (let obj of source) {
      await send(obj)
    }
  }, {
    parseLine,

    // Handle transport shutdown
    close(err, cb) {
      if(err) {
        debugLog("Error during the write: " + err);
        cb();
      }
      debugLog("Forcing flush before close");
      sendLogsToLogtail().then(cb);
    }
  })
}
