import { NS } from '@ns';
import {
  HWGW_MONEY_PERCENTAGE,
  HWGW_PREP_PORT_1,
  HWGW_PREP_PORT_2,
  HWGW_PREP_PORT_3,
  HWGW_PREP_PORT_4,
} from 'const/files';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';

export class WgwBatch {
  batchPort: number;
  sleepGrow: number;
  sleepWeakGrow: number;
  weakThreads: number = 0;
  weakHomeThreads: number = 0;
  growThreads: number = 0;
  growHomeThreads: number = 0;
  growWeakThreads: number = 0;
  growWeakHomeThreads: number = 0;

  constructor(portSeed: number, tempoWeak: number, tempoGrow: number) {
    if (portSeed % 4 == 0) this.batchPort = HWGW_PREP_PORT_4;
    if (portSeed % 3 == 0) this.batchPort = HWGW_PREP_PORT_3;
    if (portSeed % 2 == 0) this.batchPort = HWGW_PREP_PORT_2;
    else this.batchPort = HWGW_PREP_PORT_1;
    this.sleepGrow = Math.max(1, Math.ceil(tempoWeak - tempoGrow));
    const endGrow = this.sleepGrow + tempoGrow;
    this.sleepWeakGrow = Math.max(1, Math.ceil(endGrow - tempoWeak));
  }

  calcolaWgwThreads(ns: NS, target: HwgwServerInfo, calc: HwgOpsCalulator) {
    // calcolo thread usando i core HOME
    const cores = ns.getServer('home').cpuCores;
    let WEAKEN_PER_THREAD = ns.weakenAnalyze(1, cores);
    let GW_THREADS = ns.growthAnalyzeSecurity(1, target.name, cores) / WEAKEN_PER_THREAD;
    let growThreads = calc.calcolaGrowThreads(target.maxMoney * HWGW_MONEY_PERCENTAGE, cores);
    let weakThreads = Math.max(1, calc.calcolaWeakThread(cores));
    let growWeakThreads = Math.max(1, Math.ceil(GW_THREADS * growThreads));
    if (cores > 1) {
      // Home multicore, imposto i thread home e ricalcolo i normali
      this.growHomeThreads = growThreads;
      this.growWeakHomeThreads = growWeakThreads;
      this.weakHomeThreads = weakThreads;
      WEAKEN_PER_THREAD = ns.weakenAnalyze(1);
      GW_THREADS = ns.growthAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
      weakThreads = weakThreads = Math.max(1, calc.calcolaWeakThread());
      growThreads = calc.calcolaGrowThreads(target.maxMoney * HWGW_MONEY_PERCENTAGE);
      growWeakThreads = Math.max(1, Math.ceil(GW_THREADS * growThreads));
      this.weakThreads = weakThreads;
      this.growThreads = growThreads;
      this.growWeakThreads = growWeakThreads;
    } else {
      // imposto tutti i thread uguali
      this.growHomeThreads = growThreads;
      this.growWeakHomeThreads = growWeakThreads;
      this.weakHomeThreads = weakThreads;
      this.growThreads = growThreads;
      this.growWeakThreads = growWeakThreads;
    }
  }
}
