import { HWGW_PORT_1, HWGW_PORT_2, HWGW_PORT_3, HWGW_PORT_4 } from 'const/files';

export class HwgwBatch {
  batchPort: number;
  sleepWeakHack: number;
  sleepHack: number;
  sleepGrow: number;
  sleepWeakGrow: number;
  hackThreads: number = 0;
  hackWeakThreads: number = 0;
  growThreads: number = 0;
  growWeakThreads: number = 0;
  running = false;

  constructor(
    portSeed: number,
    tempoHack: number,
    tempoWeak: number,
    tempoGrow: number,
    batchStartDelay = 200,
    scriptDelay = 100,
    iteration = 0
  ) {
    if (portSeed % 4 == 0) this.batchPort = HWGW_PORT_4;
    if (portSeed % 3 == 0) this.batchPort = HWGW_PORT_3;
    if (portSeed % 2 == 0) this.batchPort = HWGW_PORT_2;
    else this.batchPort = HWGW_PORT_1;
    this.sleepWeakHack = Math.max(0, Math.floor((batchStartDelay + scriptDelay * 2) * iteration));
    this.sleepHack = Math.max(1, Math.floor(tempoWeak - tempoHack - scriptDelay + this.sleepWeakHack));
    const endWeakHack = tempoWeak + this.sleepWeakHack;
    this.sleepGrow = Math.max(1, Math.floor(endWeakHack - tempoGrow + scriptDelay));
    const endGrow = this.sleepGrow + tempoGrow;
    this.sleepWeakGrow = Math.max(1, Math.floor(endGrow - tempoWeak + scriptDelay));
  }
}
