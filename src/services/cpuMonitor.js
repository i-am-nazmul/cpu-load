import os from 'os';

class CpuMonitor {
  constructor(sampleIntervalMs = 1000) {
    this.sampleIntervalMs = sampleIntervalMs;
    this.intervalHandle = null;
    this.previousSnapshot = this.captureSnapshot();
    this.latestMetrics = {
      totalPercent: 0,
      perCorePercent: this.previousSnapshot.map(() => 0),
    };
  }

  start() {
    if (this.intervalHandle) {
      return;
    }

    this.intervalHandle = setInterval(() => {
      this.latestMetrics = this.calculateMetrics();
    }, this.sampleIntervalMs);

    this.intervalHandle.unref();
  }

  async sampleNow() {
    this.latestMetrics = this.calculateMetrics();
    return this.latestMetrics;
  }

  captureSnapshot() {
    return os.cpus().map((cpu) => ({ ...cpu.times }));
  }

  calculateMetrics() {
    const currentSnapshot = this.captureSnapshot();
    const perCorePercent = currentSnapshot.map((cpuTimes, index) => {
      const previousTimes = this.previousSnapshot[index] || cpuTimes;
      const currentTotal = Object.values(cpuTimes).reduce((sum, value) => sum + value, 0);
      const previousTotal = Object.values(previousTimes).reduce((sum, value) => sum + value, 0);
      const totalDiff = currentTotal - previousTotal;
      const idleDiff = cpuTimes.idle - previousTimes.idle;

      if (totalDiff <= 0) {
        return 0;
      }

      return Number((((totalDiff - idleDiff) / totalDiff) * 100).toFixed(1));
    });

    this.previousSnapshot = currentSnapshot;

    const totalPercent = perCorePercent.length
      ? Number((perCorePercent.reduce((sum, value) => sum + value, 0) / perCorePercent.length).toFixed(1))
      : 0;

    return {
      totalPercent,
      perCorePercent,
    };
  }
}

export { CpuMonitor };