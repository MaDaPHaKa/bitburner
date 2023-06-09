import { NS } from '@ns';
import { WG_COST } from 'const/hwgw';
import { HWGW_SERVER_GROW_SCRIPT, HWGW_SERVER_HACK_SCRIPT, HWGW_SERVER_WEAKEN_SCRIPT } from 'const/scripts';
import { XP_FARMER_SERVER_PREFIX } from 'const/servers';
import { HwgwBatch } from 'hwgw/hwgw-batch';
import { HwgwServerBatch } from 'hwgw/hwgw-server-batch';
import { HwgwWorkerProp } from 'hwgw/hwgw-worker-prop';
import { WgwBatch } from 'hwgw/wgw-batch';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerData } from 'utils/server-data';

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
    for (const server of serverNames) {
      if (server === 'home') continue;
      const serverData = new ServerData(ns, server);
      serverData.aggiornaServer();
      this.servers.push(serverData);
    }
  }

  async avviaHwgwBatch(
    target: HwgwServerInfo,
    batch: HwgwBatch,
    calc: HwgOpsCalulator,
    randomArg: number,
    portSeed: number
  ): Promise<boolean> {
    const serverBatches: HwgwServerBatch[] = [];
    this.aggiornaUtilizzo();
    let iteration = 0;
    let serverBatch = batch.creaServerBatch(this.ns, this.homeServer, target, calc, iteration);
    if (serverBatch.canRun) {
      serverBatches.push(serverBatch);
      iteration++;
    }
    for (const server of this.servers) {
      serverBatch = batch.creaServerBatch(this.ns, server, target, calc, iteration);
      if (serverBatch.canRun) {
        serverBatches.push(serverBatch);
        iteration++;
      }
    }

    for (let i = 0; i < serverBatches.length; i++) {
      const serverBatch = serverBatches[i];
      serverBatch.ricalcolaSleep();
      this.ns.exec(
        HWGW_SERVER_HACK_SCRIPT,
        serverBatch.server.name,
        serverBatch.hackThreads,
        ...serverBatch.getHackArgs(randomArg)
      );
      this.ns.exec(
        HWGW_SERVER_WEAKEN_SCRIPT,
        serverBatch.server.name,
        serverBatch.hackWeakThreads,
        ...serverBatch.getHackWeakArgs(randomArg)
      );

      this.ns.exec(
        HWGW_SERVER_GROW_SCRIPT,
        serverBatch.server.name,
        serverBatch.growThreads,
        ...serverBatch.getGrowArgs(randomArg)
      );
      const lastBatch = i == serverBatches.length - 1;
      const growWeakArgs = lastBatch
        ? serverBatch.getGrowWeakArgs(randomArg, portSeed)
        : serverBatch.getGrowWeakArgs(randomArg);
      this.ns.exec(HWGW_SERVER_WEAKEN_SCRIPT, serverBatch.server.name, serverBatch.growWeakThreads, ...growWeakArgs);
      if (lastBatch) {
        batch.endTime = serverBatch.weakGrowEndTime;
      }
      await this.ns.sleep(1);
    }
    return true;
  }

  aggiornaUtilizzo() {
    this.servers.forEach((el) => {
      el.aggiornaServer();
    });
    this.homeServer.aggiornaServer();
  }

  serverLiberi(): boolean {
    return this.servers.find((el) => el.freeRam > 0) !== undefined || this.homeServer.freeRam > 0;
  }

  canRun(ramNecessaria: number): boolean {
    this.aggiornaUtilizzo();
    let ramDisponibile = this.homeServer.freeRam;
    for (const server of this.servers) {
      ramDisponibile += server.freeRam;
    }
    return ramDisponibile > ramNecessaria;
  }

  // WGW Batching
  avviaWgwBatch(target: string, batch: WgwBatch): void {
    const growProp: HwgwWorkerProp = new HwgwWorkerProp(target, batch.growTime, batch.growEndTime, 0, 'PREP');
    const weakProp: HwgwWorkerProp = new HwgwWorkerProp(target, batch.weakTime, batch.weakEndTime, 0, 'PREP');
    weakProp.weakType = 1;
    const growWeakProp: HwgwWorkerProp = new HwgwWorkerProp(target, batch.weakTime, batch.weakGrowEndTime, 0, 'PREP');
    growWeakProp.weakType = 2;
    growWeakProp.writePort = batch.batchPort;
    const weakArgs = [JSON.stringify(weakProp)];
    const growArgs = [JSON.stringify(growProp)];
    const growWeakArgs = [JSON.stringify(growWeakProp)];
    this.aggiornaUtilizzo();
    const weakThreads = batch.weakThreads;
    const growThreads = batch.growThreads;
    const growWeakThreads = batch.growWeakThreads;
    this.avviaWgwScript(HWGW_SERVER_WEAKEN_SCRIPT, weakThreads, WG_COST, ...weakArgs);
    this.avviaWgwScript(HWGW_SERVER_GROW_SCRIPT, growThreads, WG_COST, ...growArgs);
    this.avviaWgwScript(HWGW_SERVER_WEAKEN_SCRIPT, growWeakThreads, WG_COST, ...growWeakArgs);
  }
  avviaWgwScript(
    scriptName: string,
    threadNeeded: number,
    ramPerThread: number,
    ...args: (boolean | string | number)[]
  ): void {
    if (threadNeeded <= 0) {
      this.ns.print('thread necessari == 0... non dovrebbe succedere');
      return;
    }
    this.aggiornaUtilizzo();
    const allServers = this.servers.slice(0);
    allServers.unshift(this.homeServer);
    let availableServers = allServers.filter((el) => el.freeRam > 0 && el.freeRam > ramPerThread * threadNeeded);
    if (availableServers.length > 0) {
      this.ns.exec(scriptName, availableServers[0].name, threadNeeded, ...args);
      return;
    }
    availableServers = allServers.filter((el) => el.freeRam > 0 && el.freeRam > ramPerThread);
    for (const server of allServers) {
      const freeThreads = server.freeRam / ramPerThread;
      const threadToLaunch = Math.floor(freeThreads > threadNeeded ? threadNeeded : freeThreads);
      if (threadToLaunch <= 1) break;
      this.ns.exec(scriptName, server.name, threadToLaunch, ...args);
      server.aggiornaServer();
      threadNeeded -= threadToLaunch;
      if (threadNeeded <= 0) {
        break;
      }
    }
  }
}
