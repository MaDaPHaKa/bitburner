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
import { HWGW_PORT_1, HWGW_PORT_2, HWGW_PORT_3, HWGW_PORT_4 } from 'const/ports';
import { HwgwWorkerProp } from 'hwgw/hwgw-worker-prop';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerData } from 'utils/server-data';

export class HwgwServerBatch {
  hackTime: number;
  growTime: number;
  weakTime: number;
  hackEndTime: number;
  weakHackEndTime: number;
  growEndTime: number;
  weakGrowEndTime: number;
  hackThreads = 0;
  hackWeakThreads = 0;
  growThreads = 0;
  growWeakThreads = 0;
  server: ServerData;
  target: HwgwServerInfo;
  calc: HwgOpsCalulator;
  scriptDelay: number;
  iteration: number;
  canRun = false;

  constructor(
    tempoHack: number,
    tempoWeak: number,
    tempoGrow: number,
    server: ServerData,
    ns: NS,
    target: HwgwServerInfo,
    calc: HwgOpsCalulator,
    iteration = 0,
    scriptDelay = 20
  ) {
    this.target = target;
    this.server = server;
    this.calc = calc;
    this.iteration = iteration;
    this.scriptDelay = scriptDelay;
    this.hackTime = tempoHack;
    this.growTime = tempoGrow;
    this.weakTime = tempoWeak;

    const buffer = BATCH_BUFFER + this.iteration * this.scriptDelay * 4;
    this.hackEndTime = Date.now() + this.weakTime + this.scriptDelay + buffer;
    this.weakHackEndTime = Date.now() + this.weakTime + this.scriptDelay * 2 + buffer;
    this.growEndTime = Date.now() + this.weakTime + this.scriptDelay * 3 + buffer;
    this.weakGrowEndTime = Date.now() + this.weakTime + this.scriptDelay * 4 + buffer;

    this.calcolaThreads(ns, calc, target);
    this.verificaServerCap(ns, calc, target);
  }

  getHackArgs(randomArg: number): (boolean | string | number)[] {
    const prop: HwgwWorkerProp = new HwgwWorkerProp(
      this.target.name,
      this.hackTime,
      this.hackEndTime,
      this.iteration,
      'BATCH'
    );
    return [JSON.stringify(prop), randomArg];
  }

  getHackWeakArgs(randomArg: number): (boolean | string | number)[] {
    const prop: HwgwWorkerProp = new HwgwWorkerProp(
      this.target.name,
      this.weakTime,
      this.weakHackEndTime,
      this.iteration,
      'BATCH'
    );
    prop.weakType = 1;
    return [JSON.stringify(prop), randomArg];
  }

  getGrowArgs(randomArg: number): (boolean | string | number)[] {
    const prop: HwgwWorkerProp = new HwgwWorkerProp(
      this.target.name,
      this.growTime,
      this.growEndTime,
      this.iteration,
      'BATCH'
    );
    return [JSON.stringify(prop), randomArg];
  }

  getGrowWeakArgs(randomArg: number, portSeed = 0): (boolean | string | number)[] {
    const prop: HwgwWorkerProp = new HwgwWorkerProp(
      this.target.name,
      this.weakTime,
      this.weakGrowEndTime,
      this.iteration,
      'BATCH'
    );
    prop.weakType = 2;
    if (portSeed > 0) {
      let port: number;
      if (portSeed % 4 == 0) port = HWGW_PORT_4;
      if (portSeed % 3 == 0) port = HWGW_PORT_3;
      if (portSeed % 2 == 0) port = HWGW_PORT_2;
      else port = HWGW_PORT_1;
      prop.writePort = port;
    }
    return [JSON.stringify(prop), randomArg];
  }

  ricalcolaSleep() {
    this.weakTime = this.calc.calcolaWeakTime();
    this.hackTime = this.calc.calcolaHackTime(this.weakTime);
    this.growTime = this.calc.calcolaGrowTime(this.hackTime);
    const buffer = BATCH_BUFFER + this.iteration * this.scriptDelay * 4;
    this.hackEndTime = Date.now() + this.weakTime + this.scriptDelay + buffer;
    this.weakHackEndTime = Date.now() + this.weakTime + this.scriptDelay * 2 + buffer;
    this.growEndTime = Date.now() + this.weakTime + this.scriptDelay * 3 + buffer;
    this.weakGrowEndTime = Date.now() + this.weakTime + this.scriptDelay * 4 + buffer;
  }

  private calcolaThreads(
    ns: NS,
    calc: HwgOpsCalulator,
    target: HwgwServerInfo,
    percentage: number = HWGW_MONEY_PERCENTAGE
  ) {
    const cores = this.server.cores;
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
    this.server.aggiornaServer();
    while (!checkOrExit) {
      const ramNecessaria =
        (this.growWeakThreads + this.hackWeakThreads + this.growThreads) * WG_COST + this.hackThreads * H_COST;
      if (this.server.freeRam >= ramNecessaria) {
        this.canRun = true;
        checkOrExit = true;
      } else if (lowerPerc > HWGW_MONEY_MIN_PERCENTAGE) {
        this.calcolaThreads(ns, calc, target, lowerPerc);
        lowerPerc -= HWGW_MONEY_ITERATION_PERCENTAGE;
      } else {
        checkOrExit = true;
      }
    }
  }
}
