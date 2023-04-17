import { NS } from '@ns';
import { HWGW_MONEY_PERCENTAGE, HWGW_PORT_1, HWGW_PORT_2, HWGW_PORT_3, HWGW_PORT_4 } from 'const/files';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';

export class HwgwBatch {
  batchPort: number;
  sleepWeakHack: number;
  sleepHack: number;
  sleepGrow: number;
  sleepWeakGrow: number;
  hackThreads: number = 0;
  hackWeakThreads: number = 0;
  hackWeakHomeThreads: number = 0;
  growThreads: number = 0;
  growHomeThreads: number = 0;
  growWeakThreads: number = 0;
  growWeakHomeThreads: number = 0;
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

  calcolaHwgwThreads(ns: NS, target: HwgwServerInfo, calc: HwgOpsCalulator) {
    // calcolo thread usando i core HOME
    const cores = ns.getServer('home').cpuCores;
    this.hackThreads = calc.calcolaHackThread(HWGW_MONEY_PERCENTAGE);
    this.calcolaHomeThreads(ns, calc, target);
    this.calcolaServerThreads(ns, calc, target);
  }

  private calcolaHomeThreads(ns: NS, calc: HwgOpsCalulator, target: HwgwServerInfo) {
    const cores = ns.getServer('home').cpuCores;
    let WEAKEN_PER_THREAD = ns.weakenAnalyze(1, cores);
    let HW_THREADS = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
    let GW_THREADS = ns.growthAnalyzeSecurity(1, target.name, cores) / WEAKEN_PER_THREAD;
    this.growHomeThreads = calc.calcolaGrowThreads(target.maxMoney * HWGW_MONEY_PERCENTAGE, cores);
    this.growWeakHomeThreads = Math.max(1, Math.ceil(HW_THREADS * this.hackThreads));
    this.hackWeakHomeThreads = Math.max(1, Math.ceil(GW_THREADS * this.growHomeThreads));
  }

  private calcolaServerThreads(ns: NS, calc: HwgOpsCalulator, target: HwgwServerInfo) {
    const WEAKEN_PER_THREAD = ns.weakenAnalyze(1);
    const HW_THREADS = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
    const GW_THREADS = ns.growthAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
    this.hackWeakThreads = Math.max(1, Math.ceil(HW_THREADS * this.hackThreads));
    this.growThreads = calc.calcolaGrowThreads(target.maxMoney * HWGW_MONEY_PERCENTAGE);
    this.growWeakThreads = Math.max(1, Math.ceil(GW_THREADS * this.growThreads));
  }
}
