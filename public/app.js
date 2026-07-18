const coreMeters = document.getElementById('coreMeters');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

function renderCoreMeters(values = []) {
  coreMeters.innerHTML = values
    .map((value, index) => {
      return `
        <div class="meter-card">
          <div class="meter-top">
            <span>Core ${index + 1}</span>
            <strong>${value.toFixed(1)}%</strong>
          </div>
          <div class="meter-track">
            <div class="meter-fill" style="width: ${Math.min(100, Math.max(0, value))}%"></div>
          </div>
        </div>
      `;
    })
    .join('');
}

async function refreshStatus() {
  const status = await requestJson('/api/status');

  startBtn.disabled = status.loadRunning;
  stopBtn.disabled = !status.loadRunning;
  renderCoreMeters(status.cpu.perCorePercent);
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  try {
    await requestJson('/api/load/start', { method: 'POST' });
    await refreshStatus();
  } finally {
    startBtn.disabled = false;
  }
});

stopBtn.addEventListener('click', async () => {
  stopBtn.disabled = true;
  try {
    await requestJson('/api/load/stop', { method: 'POST' });
    await refreshStatus();
  } finally {
    stopBtn.disabled = false;
  }
});

refreshStatus();
setInterval(refreshStatus, 1000);