import { NS } from '@ns';
import { HwgwBatch } from 'hwgw/hwgw-batch';
import { WgwBatch } from 'hwgw/wgw-batch';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerData } from 'utils/server-data';
import {
  HWGW_SERVER_GROW_SCRIPT,
  HWGW_SERVER_HACK_SCRIPT,
  HWGW_SERVER_WEAKEN_SCRIPT,
  H_COST,
  WG_COST,
  XP_FARMER_SERVER_PREFIX,
} from '/const/files';

export class HwgwServerManager {
  ns: NS;
  servers: ServerData[] = [];
  homeServer: ServerData;

  constructor(ns: NS) {
    this.ns = ns;
    const serverNames = ns
      .getPurchasedServers()
      .filter((el) => el !== 'home' && !el.startsWith(XP_FARMER_SERVER_PREFIX));
    this.homeServer = new ServerData(ns, 'home');
    this.homeServer.aggiornaServer();
    for (let server of serverNames) {
      if (server == 'home') continue;
      const serverData = new ServerData(ns, server);
      serverData.aggiornaServer();
      this.servers.push(serverData);
    }
  }

  avviaHwgwBatch(target: HwgwServerInfo, batch: HwgwBatch, calc: HwgOpsCalulator, randomArg: number): void {
    const hackArgs = [target.name, batch.sleepHack, randomArg];
    const hackWeakArgs = [target.name, batch.sleepWeakHack, randomArg];
    const growArgs = [target.name, batch.sleepGrow, randomArg];
    const growWeakArgs = [target.name, batch.sleepWeakGrow, batch.batchPort, randomArg];
    this.aggiornaUtilizzo();
    let hackWeakThreads = batch.hackWeakThreads;
    let growThreads = batch.growThreads;
    let growWeakThreads = batch.growWeakThreads;
    let hackWeakServer: ServerData | undefined;
    let growServer: ServerData | undefined;
    let growWeakServer: ServerData | undefined;
    if (this.homeServer.cores > 1) {
      const hackWeakHomeRam = batch.hackWeakHomeThreads * WG_COST;
      const growHomeRam = batch.growHomeThreads * WG_COST;
      const growWeakHomeRam = batch.growWeakHomeThreads * WG_COST;
      let homeFreeRam = this.homeServer.freeRam;
      if (homeFreeRam > hackWeakHomeRam) {
        hackWeakServer = this.homeServer;
        hackWeakThreads = batch.hackWeakHomeThreads;
        homeFreeRam -= hackWeakHomeRam;
      }
      if (homeFreeRam > growHomeRam) {
        growServer = this.homeServer;
        growThreads = batch.growHomeThreads;
        homeFreeRam -= growHomeRam;
      }
      if (homeFreeRam > growWeakHomeRam) {
        growWeakServer = this.homeServer;
        growWeakThreads = batch.growWeakHomeThreads;
        homeFreeRam -= growWeakHomeRam;
      }
    }
    this.avviaHwgwScript(HWGW_SERVER_HACK_SCRIPT, batch.hackThreads, H_COST, undefined, ...hackArgs);
    this.avviaHwgwScript(HWGW_SERVER_WEAKEN_SCRIPT, hackWeakThreads, WG_COST, hackWeakServer, ...hackWeakArgs);
    this.avviaHwgwScript(HWGW_SERVER_GROW_SCRIPT, growThreads, WG_COST, growServer, ...growArgs);
    this.avviaHwgwScript(HWGW_SERVER_WEAKEN_SCRIPT, growWeakThreads, WG_COST, growWeakServer, ...growWeakArgs);
  }

  avviaWgwBatch(target: string, batch: WgwBatch): void {
    const weakArgs = [target];
    const growArgs = [target, batch.sleepGrow];
    const growWeakArgs = [target, batch.sleepWeakGrow, batch.batchPort];
    this.aggiornaUtilizzo();
    let weakThreads = batch.weakThreads;
    let growThreads = batch.growThreads;
    let growWeakThreads = batch.growWeakThreads;
    let hackWeakServer: ServerData | undefined;
    let growServer: ServerData | undefined;
    let growWeakServer: ServerData | undefined;
    if (this.homeServer.cores > 1) {
      const weakHomeRam = batch.weakHomeThreads * WG_COST;
      const growHomeRam = batch.growHomeThreads * WG_COST;
      const growWeakHomeRam = batch.growWeakHomeThreads * WG_COST;
      let homeFreeRam = this.homeServer.freeRam;
      if (homeFreeRam > weakHomeRam) {
        hackWeakServer = this.homeServer;
        weakThreads = batch.weakHomeThreads;
        homeFreeRam -= weakHomeRam;
      }
      if (homeFreeRam > growHomeRam) {
        growServer = this.homeServer;
        growThreads = batch.growHomeThreads;
        homeFreeRam -= growHomeRam;
      }
      if (homeFreeRam > growWeakHomeRam) {
        growWeakServer = this.homeServer;
        growWeakThreads = batch.growWeakHomeThreads;
        homeFreeRam -= growWeakHomeRam;
      }
    }
    this.avviaHwgwScript(HWGW_SERVER_WEAKEN_SCRIPT, weakThreads, WG_COST, hackWeakServer, ...weakArgs);
    this.avviaHwgwScript(HWGW_SERVER_GROW_SCRIPT, growThreads, WG_COST, growServer, ...growArgs);
    this.avviaHwgwScript(HWGW_SERVER_WEAKEN_SCRIPT, growWeakThreads, WG_COST, growWeakServer, ...growWeakArgs);
  }

  avviaHwgwScript(
    scriptName: string,
    threadNeeded: number,
    ramPerThread: number,
    server: ServerData | undefined,
    ...args: (boolean | string | number)[]
  ): void {
    if (threadNeeded <= 0) {
      return;
    }
    if (server) {
      this.ns.exec(scriptName, server.name, threadNeeded, ...args);
      return;
    }
    this.aggiornaUtilizzo();
    let availableServers = this.servers.filter((el) => el.freeRam > 0 && el.freeRam > ramPerThread * threadNeeded);
    if (availableServers.length > 0) {
      this.ns.exec(scriptName, availableServers[0].name, threadNeeded, ...args);
      return;
    }
    for (let server of availableServers) {
      const freeThreads = server.freeRam / ramPerThread;
      let threadToLaunch = Math.floor(freeThreads > threadNeeded ? threadNeeded : freeThreads);
      if (threadToLaunch <= 1) break;
      this.ns.exec(scriptName, server.name, threadToLaunch, ...args);
      server.aggiornaServer();
      threadNeeded -= threadToLaunch;
      if (threadNeeded <= 0) {
        break;
      }
    }
  }

  aggiornaUtilizzo() {
    this.servers.forEach((el) => {
      el.aggiornaServer();
    });
  }

  serverLiberi(): boolean {
    return this.servers.find((el) => el.freeRam > 0) !== undefined;
  }
}
