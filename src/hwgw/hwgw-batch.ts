export class HwgwBatch {
  batchEndTime: number = -1;
  batchPort: number;
  sleepWeakHack: number;
  sleepHack: number;
  sleepGrow: number;
  sleepWeakGrow: number;
  tempoBatch: number;
  endTime: number = -1;
  target: string;
  running = false;

  constructor(
    target: string,
    batchPort: number,
    tempoHack: number,
    tempoWeak: number,
    tempoGrow: number,
    batchStartDelay = 200,
    scriptDelay = 100,
    iteration = 0
  ) {
    this.target = target;
    this.batchPort = batchPort;
    this.sleepWeakHack = Math.max(
      0,
      Math.floor((batchStartDelay + scriptDelay * 2) * iteration)
    );
    this.sleepHack = Math.max(
      1,
      Math.floor(tempoWeak - tempoHack - scriptDelay + this.sleepWeakHack)
    );
    const endWeakHack = tempoWeak + this.sleepWeakHack;
    this.sleepGrow = Math.max(
      1,
      Math.floor(endWeakHack - tempoGrow + scriptDelay)
    );
    const endGrow = this.sleepGrow + tempoGrow;
    this.sleepWeakGrow = Math.max(
      1,
      Math.floor(endGrow - tempoWeak + scriptDelay)
    );
    this.tempoBatch = this.sleepWeakGrow + tempoWeak;
  }

  started() {
    this.endTime = new Date().getTime() + this.tempoBatch;
  }
}
