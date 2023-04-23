import { NS } from '@ns';
import {
  HWGW_MONEY_ITERATION_PERCENTAGE,
  HWGW_MONEY_MIN_PERCENTAGE,
  HWGW_MONEY_PERCENTAGE,
  HWGW_PORT_1,
  HWGW_PORT_2,
  HWGW_PORT_3,
  HWGW_PORT_4,
  H_COST,
  WG_COST,
} from 'const/files';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerData } from '/utils/server-data';

export class HwgwServerBatch {
  sleepWeakHack: number;
  sleepHack: number;
  sleepGrow: number;
  sleepWeakGrow: number;
  hackThreads: number = 0;
  hackWeakThreads: number = 0;
  growThreads: number = 0;
  growWeakThreads: number = 0;
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
    scriptDelay = 100
  ) {
    this.target = target;
    this.server = server;
    this.calc = calc;
    this.iteration = iteration;
    this.scriptDelay = scriptDelay;

    this.sleepWeakHack = Math.max(0, Math.floor(scriptDelay * iteration * 4));
    this.sleepHack = Math.max(1, Math.floor(tempoWeak - tempoHack - scriptDelay + this.sleepWeakHack));
    const endWeakHack = tempoWeak + this.sleepWeakHack;
    this.sleepGrow = Math.max(1, Math.floor(endWeakHack - tempoGrow + scriptDelay));
    const endGrow = this.sleepGrow + tempoGrow;
    this.sleepWeakGrow = Math.max(1, Math.floor(endGrow - tempoWeak + scriptDelay));
    this.calcolaThreads(ns, calc, target);
    this.verificaServerCap(ns, calc, target);
  }

  getHackArgs(randomArg: number): (boolean | string | number)[] {
    return [this.target.name, this.sleepHack, randomArg];
  }

  getHackWeakArgs(randomArg: number): (boolean | string | number)[] {
    return [this.target.name, this.sleepWeakHack, randomArg];
  }

  getGrowArgs(randomArg: number): (boolean | string | number)[] {
    return [this.target.name, this.sleepGrow, randomArg];
  }

  getGrowWeakArgs(randomArg: number, portSeed: number | undefined = undefined): (boolean | string | number)[] {
    const growWeakArgs = [this.target.name, this.sleepWeakGrow];
    if (portSeed) {
      let port: number;
      if (portSeed % 4 == 0) port = HWGW_PORT_4;
      if (portSeed % 3 == 0) port = HWGW_PORT_3;
      if (portSeed % 2 == 0) port = HWGW_PORT_2;
      else port = HWGW_PORT_1;
      growWeakArgs.push(port);
    }
    growWeakArgs.push(randomArg);
    return growWeakArgs;
  }

  ricalcolaSleep() {
    const tempoHack = this.calc.calcolaHackTime();
    const tempoWeak = this.calc.calcolaWeakTime();
    const tempoGrow = this.calc.calcolaGrowTime();
    this.sleepWeakHack = Math.max(0, Math.floor(this.scriptDelay * this.iteration * 4));
    this.sleepHack = Math.max(1, Math.floor(tempoWeak - tempoHack - this.scriptDelay + this.sleepWeakHack));
    const endWeakHack = tempoWeak + this.sleepWeakHack;
    this.sleepGrow = Math.max(1, Math.floor(endWeakHack - tempoGrow + this.scriptDelay));
    const endGrow = this.sleepGrow + tempoGrow;
    this.sleepWeakGrow = Math.max(1, Math.floor(endGrow - tempoWeak + this.scriptDelay));
  }

  private calcolaThreads(
    ns: NS,
    calc: HwgOpsCalulator,
    target: HwgwServerInfo,
    percentage: number = HWGW_MONEY_PERCENTAGE
  ) {
    const cores = this.server.cores;
    this.hackThreads = calc.calcolaHackThread(percentage);
    let WEAKEN_PER_THREAD = ns.weakenAnalyze(1, cores);
    let HW_THREADS = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
    let GW_THREADS = ns.growthAnalyzeSecurity(1, undefined, cores) / WEAKEN_PER_THREAD;
    this.hackWeakThreads = Math.max(1, Math.ceil(HW_THREADS * this.hackThreads));
    this.growThreads = calc.calcolaGrowThreads(target.maxMoney - target.maxMoney * percentage, cores);
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
