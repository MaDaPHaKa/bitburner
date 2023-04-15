import { NS, Server } from "@ns";
import { ServerInfo } from "utils/server-info";
export class HwgOpsCalulator {
  ns: NS;
  target: ServerInfo;
  targetServer: Server;
  hasFormulas = false;
  constructor(ns: NS, target: ServerInfo) {
    this.ns = ns;
    this.target = target;
    this.targetServer = ns.getServer(this.target.name);
    this.hasFormulas = ns.fileExists("formulas.exe", "home");
  }

  calcolaGrowThreads(cores: number = 1, debug = false) {
    const threads = this.growtThreadsInternal(cores, debug);
    return Math.max(1, Math.ceil(threads));
  }

  calcolaGrowTime(debug = false) {
    return this.growtTimeInternal();
  }

  calcolaWeakThread(cores: number = 1) {
    const currentSec = this.ns.getServerSecurityLevel(this.target.name);
    const secWeak = this.ns.weakenAnalyze(1, cores);
    const rate = (currentSec - this.target.minSecurity) / secWeak;
    return Math.max(1, Math.ceil(rate));
  }

  calcolaWeakTime() {
    return this.weakTimeInternal();
  }

  calcolaHackThread() {
    const maxMoney = this.target.maxMoney;
    const moneyPerThread =
      (this.hasFormulas
        ? this.ns.formulas.hacking.hackPercent(
            this.targetServer,
            this.ns.getPlayer()
          )
        : this.ns.hackAnalyze(this.target.name)) * maxMoney;
    const minWanted = maxMoney * 0.9;
    const rate = (maxMoney - minWanted) / moneyPerThread;
    const threads = Math.max(1, Math.floor(rate));
    return threads;
  }

  calcolaHackPerc() {
    if (this.hasFormulas) {
      return this.ns.formulas.hacking.hackPercent(
        this.targetServer,
        this.ns.getPlayer()
      );
    } else {
      return this.ns.hackAnalyze(this.target.name);
    }
  }

  calcolaHackTime() {
    if (this.hasFormulas) {
      return this.ns.formulas.hacking.hackTime(
        this.targetServer,
        this.ns.getPlayer()
      );
    } else {
      return this.ns.getHackTime(this.target.name);
    }
  }

  calcolaHackChance() {
    if (this.hasFormulas) {
      return this.ns.formulas.hacking.hackChance(
        this.targetServer,
        this.ns.getPlayer()
      );
    } else {
      return this.ns.getHackTime(this.target.name);
    }
  }

  calcolaWeakThreadPerGrow(growThreads: number) {
    return Math.ceil((growThreads * 0.004) / 0.05);
  }

  private growtThreadsInternal(cores: number = 1, debug = false): number {
    if (this.hasFormulas) {
      return this.ns.formulas.hacking.growThreads(
        this.targetServer,
        this.ns.getPlayer(),
        this.target.maxMoney,
        cores
      );
    } else {
      const currentMoney = this.ns.getServerMoneyAvailable(this.target.name);
      const rate = this.target.maxMoney / (currentMoney > 0 ? currentMoney : 1);
      return this.ns.growthAnalyze(this.target.name, rate, cores);
    }
  }

  private growtTimeInternal(): number {
    if (this.hasFormulas) {
      return this.ns.formulas.hacking.growTime(
        this.targetServer,
        this.ns.getPlayer()
      );
    } else {
      return this.ns.getGrowTime(this.target.name);
    }
  }

  private weakTimeInternal(): number {
    if (this.hasFormulas) {
      return this.ns.formulas.hacking.weakenTime(
        this.targetServer,
        this.ns.getPlayer()
      );
    } else {
      return this.ns.getWeakenTime(this.target.name);
    }
  }
}
