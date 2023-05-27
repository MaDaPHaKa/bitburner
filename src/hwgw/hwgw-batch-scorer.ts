import { NS } from '@ns';
import {
  BATCH_BUFFER,
  HACK_SEC_INCREASE,
  HWGW_MONEY_ITERATION_PERCENTAGE,
  HWGW_MONEY_MIN_PERCENTAGE,
  HWGW_MONEY_PERCENTAGE,
  H_COST,
  WG_COST,
} from 'const/hwgw';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';

export class HwgwBatchScorer {
  batchMoney = 0;

  weakTime: number;
  weakGrowEndTime: number;
  hackThreads = 0;
  hackWeakThreads = 0;
  growThreads = 0;
  growWeakThreads = 0;
  serverMaxRam = 0;
  serverCores;
  calc: HwgOpsCalulator;
  scriptDelay: number;
  iteration: number;
  canRun = false;

  constructor(
    ns: NS,
    tempoWeak: number,
    serverRam: number,
    target: HwgwServerInfo,
    calc: HwgOpsCalulator,
    serverCores = 1,
    iteration = 0,
    scriptDelay = 20
  ) {
    this.calc = calc;
    this.iteration = iteration;
    this.scriptDelay = scriptDelay;
    this.weakTime = tempoWeak;
    this.serverMaxRam = serverRam;
    this.serverCores = serverCores;

    const buffer = BATCH_BUFFER + this.iteration * this.scriptDelay * 4;
    this.weakGrowEndTime = Date.now() + this.weakTime + this.scriptDelay * 4 + buffer;
    this.calcolaThreads(ns, calc, target);
    this.verificaServerCap(ns, calc, target);
  }

  private calcolaThreads(
    ns: NS,
    calc: HwgOpsCalulator,
    target: HwgwServerInfo,
    percentage: number = HWGW_MONEY_PERCENTAGE
  ) {
    const cores = this.serverCores;
    this.hackThreads = calc.calcolaHackThread(percentage);
    this.growThreads = calc.calcolaGrowThreads(target.maxMoney - target.maxMoney * percentage, cores);
    const WEAKEN_PER_THREAD = ns.weakenAnalyze(1, cores);
    const HW_THREADS = HACK_SEC_INCREASE / WEAKEN_PER_THREAD;
    const GW_THREADS = ns.growthAnalyzeSecurity(1, undefined, cores) / WEAKEN_PER_THREAD;
    this.hackWeakThreads = Math.max(1, Math.ceil(HW_THREADS * this.hackThreads));
    this.growWeakThreads = Math.max(1, Math.ceil(GW_THREADS * this.growThreads));
  }

  private verificaServerCap(ns: NS, calc: HwgOpsCalulator, target: HwgwServerInfo) {
    let checkOrExit = false;
    let lowerPerc = HWGW_MONEY_PERCENTAGE - HWGW_MONEY_ITERATION_PERCENTAGE;
    while (!checkOrExit) {
      const ramNecessaria =
        (this.growWeakThreads + this.hackWeakThreads + this.growThreads) * WG_COST + this.hackThreads * H_COST;
      if (this.serverMaxRam >= ramNecessaria) {
        this.canRun = true;
        checkOrExit = true;
      } else if (lowerPerc > HWGW_MONEY_MIN_PERCENTAGE) {
        this.calcolaThreads(ns, calc, target, lowerPerc);
        lowerPerc -= HWGW_MONEY_ITERATION_PERCENTAGE;
      } else {
        checkOrExit = true;
      }
    }
    if (this.canRun) {
      this.batchMoney = target.maxMoney * lowerPerc;
    }
  }
}
