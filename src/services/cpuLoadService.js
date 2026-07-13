const os = require('os');
const path = require('path');
const { Worker } = require('worker_threads');

class CpuLoadService {
  constructor(options = {}) {
    this.workerCount = options.workerCount || Math.min(2, os.cpus().length || 1);
    this.workers = [];
    this.running = false;
  }

  isRunning() {
    return this.running;
  }

  getWorkerCount() {
    return this.workerCount;
  }

  async start() {
    if (this.running) {
      return;
    }

    const workerPath = path.join(__dirname, '..', 'workers', 'cpuBurnWorker.js');

    this.workers = Array.from({ length: this.workerCount }, () => {
      return new Worker(workerPath);
    });

    this.running = true;
  }

  async stop() {
    if (!this.running) {
      return;
    }

    await Promise.all(
      this.workers.map((worker) => {
        return new Promise((resolve) => {
          worker.once('exit', resolve);
          worker.postMessage({ type: 'stop' });
          setTimeout(() => {
            worker.terminate().then(resolve).catch(resolve);
          }, 250);
        });
      })
    );

    this.workers = [];
    this.running = false;
  }
}

module.exports = { CpuLoadService };