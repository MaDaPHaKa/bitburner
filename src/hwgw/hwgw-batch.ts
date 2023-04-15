import { NS } from "@ns";
export class HwgwBatch {
  tempoHack: number;
  tempoWeak: number;
  tempoGrow: number;
  batchEndTime: number = -1;
  batchRuns: HwgwBatchRun[] = [];

  constructor(tempoHack: number, tempoWeak: number, tempoGrow: number) {
    this.tempoGrow = tempoGrow;
    this.tempoHack = tempoHack;
    this.tempoWeak = tempoWeak;
  }

  calcolaRun(
    iterazioni: number,
    batchStartDelay: number = 200,
    scritpDelay: number = 100
  ) {
    this.batchEndTime = 0;
    this.batchRuns = [];
    for (let i = 0; i < iterazioni; i++) {
      this.batchRuns.push(
        this.calcolaIterazione(batchStartDelay, scritpDelay, i)
      );
    }
  }

  calcolaIterazione(
    batchStartDelay: number = 200,
    scritpDelay: number = 100,
    iteration: number = 0
  ): HwgwBatchRun {
    return new HwgwBatchRun(
      this.tempoHack,
      this.tempoWeak,
      this.tempoGrow,
      batchStartDelay,
      scritpDelay,
      iteration
    );
  }
}

export class HwgwBatchRun {
  sleepWeakHack: number;
  sleepHack: number;
  sleepGrow: number;
  sleepWeakGrow: number;

  constructor(
    tempoHack: number,
    tempoWeak: number,
    tempoGrow: number,
    batchStartDelay: number = 200,
    scritpDelay: number = 100,
    iteration: number = 0
  ) {
    this.sleepWeakHack = (batchStartDelay + scritpDelay * 2) * iteration;
    this.sleepHack = tempoWeak - tempoHack - scritpDelay + this.sleepWeakHack;
    const endWeakHack = tempoWeak + this.sleepWeakHack;
    this.sleepGrow = endWeakHack - tempoGrow + scritpDelay;
    const endGrow = this.sleepGrow + tempoGrow;
    this.sleepWeakGrow = endGrow - tempoWeak + scritpDelay;
  }
}
