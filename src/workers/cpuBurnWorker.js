const { parentPort } = require('worker_threads');

let keepRunning = true;

function burnCpu() {
  if (!keepRunning) {
    return;
  }

  const endTime = Date.now() + 200;

  while (Date.now() < endTime && keepRunning) {
    Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  setImmediate(burnCpu);
}

parentPort.on('message', (message) => {
  if (message && message.type === 'stop') {
    keepRunning = false;
    process.exit(0);
  }
});

burnCpu();