import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { CpuLoadService } from './services/cpuLoadService.js';
import { CpuMonitor } from './services/cpuMonitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getEc2InstanceId() {
  try {
    const tokenResponse = await fetch('http://169.254.169.254/latest/api/token', {
      method: 'PUT',
      headers: {
        'X-aws-ec2-metadata-token-ttl-seconds': '21600',
      },
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token request failed with status ${tokenResponse.status}`);
    }

    const token = await tokenResponse.text();

    const instanceResponse = await fetch('http://169.254.169.254/latest/meta-data/instance-id', {
      headers: {
        'X-aws-ec2-metadata-token': token,
      },
    });

    if (!instanceResponse.ok) {
      throw new Error(`Instance ID request failed with status ${instanceResponse.status}`);
    }

    return instanceResponse.text();
  } catch (error) {
    console.warn('Unable to resolve EC2 instance ID from IMDS, using fallback.', error);
    return 'Local / Unknown';
  }
}

function createServer() {
  const app = express();
  const cpuLoadService = new CpuLoadService({ workerCount: 2 });
  const cpuMonitor = new CpuMonitor();
  let instanceId = 'Local / Unknown';

  const instanceIdPromise = (async () => {
    instanceId = await getEc2InstanceId();
  })();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/api/status', async (_req, res) => {
    const metrics = await cpuMonitor.sampleNow();
    await instanceIdPromise;

    res.json({
      loadRunning: cpuLoadService.isRunning(),
      workerCount: cpuLoadService.getWorkerCount(),
      instanceId,
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

export { createServer };