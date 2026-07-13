const express = require('express');
const path = require('path');
const { CpuLoadService } = require('./services/cpuLoadService');
const { CpuMonitor } = require('./services/cpuMonitor');

function createServer() {
  const app = express();
  const cpuLoadService = new CpuLoadService({ workerCount: 2 });
  const cpuMonitor = new CpuMonitor();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/api/status', async (_req, res) => {
    const metrics = await cpuMonitor.sampleNow();

    res.json({
      loadRunning: cpuLoadService.isRunning(),
      workerCount: cpuLoadService.getWorkerCount(),
      cpu: metrics,
    });
  });

  app.post('/api/load/start', async (_req, res) => {
    await cpuLoadService.start();
    res.json({ ok: true, message: 'CPU load started.' });
  });

  app.post('/api/load/stop', async (_req, res) => {
    await cpuLoadService.stop();
    res.json({ ok: true, message: 'CPU load stopped.' });
  });

  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  cpuMonitor.start();

  return app;
}

module.exports = { createServer };