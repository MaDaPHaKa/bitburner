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

  calcolaGrowThreads(
    startingMoney: number | undefined,
    cores: number = 1,
    debug = false
  ) {
    const threads = this.growtThreadsInternal(startingMoney, cores, debug);
    return Math.max(1, Math.ceil(threads));
  }

  calcolaGrowTime(debug = false): number {
    let time: number;
    if (this.hasFormulas) {
      time = this.ns.formulas.hacking.growTime(
        this.targetServer,
        this.ns.getPlayer()
      );
    } else {
      time = this.ns.getGrowTime(this.target.name);
    }
    return Math.max(1, Math.ceil(time));
  }

  calcolaWeakThread(cores: number = 1) {
    const currentSec = this.ns.getServerSecurityLevel(this.target.name);
    const secWeak = this.ns.weakenAnalyze(1, cores);
    const rate = (currentSec - this.target.minSecurity) / secWeak;
    return Math.max(1, Math.ceil(rate));
  }

  calcolaWeakTime() {
    let time: number;
    if (this.hasFormulas) {
      time = this.ns.formulas.hacking.weakenTime(
        this.targetServer,
        this.ns.getPlayer()
      );
    } else {
      time = this.ns.getWeakenTime(this.target.name);
    }
    return Math.max(1, Math.ceil(time));
  }

  calcolaHackThread(percentage = 0.9) {
    const maxMoney = this.target.maxMoney;
    const moneyPerThread =
      (this.hasFormulas
        ? this.ns.formulas.hacking.hackPercent(
            this.targetServer,
            this.ns.getPlayer()
          )
        : this.ns.hackAnalyze(this.target.name)) * maxMoney;
    const minWanted = maxMoney * percentage;
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
    let time;
    if (this.hasFormulas) {
      time = this.ns.formulas.hacking.hackTime(
        this.targetServer,
        this.ns.getPlayer()
      );
    } else {
      time = this.ns.getHackTime(this.target.name);
    }
    return Math.max(1, Math.ceil(time));
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

  calcolaHackXp() {
    if (this.hasFormulas) {
      return this.ns.formulas.hacking.hackExp(
        this.targetServer,
        this.ns.getPlayer()
      );
    } else {
      return -1;
    }
  }

  calcolaWeakThreadPerGrow(growThreads: number) {
    return Math.ceil((growThreads * 0.004) / 0.05);
  }

  private growtThreadsInternal(
    startingMoney: number | undefined,
    cores: number = 1,
    debug = false
  ): number {
    if (this.hasFormulas) {
      if (startingMoney) this.targetServer.moneyAvailable = startingMoney;
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
}
