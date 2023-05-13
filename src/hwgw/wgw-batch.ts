import { NS } from '@ns';
import { BATCH_BUFFER, WG_COST } from 'const/hwgw';
import { HWGW_PREP_PORT_1, HWGW_PREP_PORT_2, HWGW_PREP_PORT_3, HWGW_PREP_PORT_4 } from 'const/ports';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';

export class WgwBatch {
  batchPort: number;
  growTime: number;
  weakTime: number;
  weakEndTime: number;
  growEndTime: number;
  weakGrowEndTime: number;
  weakThreads: number = 0;
  growThreads: number = 0;
  growWeakThreads: number = 0;

  constructor(portSeed: number, tempoWeak: number, tempoGrow: number, scriptDelay = 20) {
    if (portSeed % 4 == 0) this.batchPort = HWGW_PREP_PORT_4;
    if (portSeed % 3 == 0) this.batchPort = HWGW_PREP_PORT_3;
    if (portSeed % 2 == 0) this.batchPort = HWGW_PREP_PORT_2;
    else this.batchPort = HWGW_PREP_PORT_1;
    this.growTime = tempoGrow;
    this.weakTime = tempoWeak;

    const buffer = BATCH_BUFFER;
    this.weakEndTime = Date.now() + this.weakTime + scriptDelay + buffer;
    this.growEndTime = Date.now() + this.weakTime + scriptDelay * 2 + buffer;
    this.weakGrowEndTime = Date.now() + this.weakTime + scriptDelay * 3 + buffer;
  }

  calcolaWgwThreads(ns: NS, target: HwgwServerInfo, calc: HwgOpsCalulator) {
    // calcolo thread usando i core HOME
    let WEAKEN_PER_THREAD = ns.weakenAnalyze(1);
    let GW_THREADS = ns.growthAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
    this.growThreads = calc.calcolaGrowThreads(undefined);
    this.weakThreads = Math.max(1, calc.calcolaWeakThread(1));
    this.growWeakThreads = Math.max(1, Math.ceil(GW_THREADS * this.growThreads));
  }

  getNeededRam(): number {
    return (this.growThreads + this.growWeakThreads + this.weakThreads) * WG_COST;
  }
}
