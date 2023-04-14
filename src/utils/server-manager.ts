import { NS } from "@ns";
import { ServerData } from "utils/server-data";

export class ServerManager {
  ns: NS;
  servers: ServerData[] = [];
  hackTargets: string[] = [];
  growTargets: string[] = [];
  weakTargets: string[] = [];

  constructor(ns: NS, serverNames: string[]) {
    this.ns = ns;
    for (let server of serverNames) {
      const serverData = new ServerData(ns, server);
      serverData.aggiornaServer();
      this.servers.push(serverData);
    }
  }

  avviaScript(
    scriptName: string,
    threadNeeded: number,
    ramPerThread: number,
    target: string,
    debug = false
  ): void {
    if (threadNeeded <= 0) {
      if (debug) {
        this.ns.print("target: ", target);
        this.ns.print("script: ", scriptName);
        this.ns.print("0 thread necessari");
      }
      return;
    }
    this.aggiornaUtilizzo();
    const availableServers = this.servers.filter(
      (el) => el.freeRam > 0 && el.freeRam > ramPerThread
    );
    if (debug) {
      this.ns.print("server disponibili: ", availableServers.length);
    }
    for (let server of availableServers) {
      const freeThreads = server.freeRam / ramPerThread;
      if (debug) {
        this.ns.print("script: ", scriptName);
        this.ns.print("server: ", server.name);
        this.ns.print("freeThreads: ", freeThreads);
      }
      let threadToLaunch = Math.floor(
        freeThreads > threadNeeded ? threadNeeded : freeThreads
      );
      if (threadToLaunch > 0 && threadToLaunch < 1) threadToLaunch = 1;
      if (threadToLaunch <= 0) break;
      if (debug) {
        this.ns.print("lancio script: ", scriptName);
        this.ns.print("server: ", server.name);
        this.ns.print("thread: ", threadToLaunch);
        this.ns.print("target: ", target);
      } else {
        this.ns.exec(
          scriptName,
          server.name,
          threadToLaunch,
          target,
          threadToLaunch
        );
      }
      server.aggiornaServer();
      threadNeeded -= threadToLaunch;
      if (debug) {
        this.ns.print("post lancio script: ", scriptName);
        this.ns.print("thread rimanenti: ", threadNeeded);
        this.ns.print("ram libera server: ", server.freeRam);
      }
      if (threadNeeded <= 0) {
        this.aggiornaTargetInterni(scriptName, target);
        break;
      }
    }
  }

  aggiornaUtilizzo(clearTargets = false) {
    if (clearTargets) {
      this.hackTargets = [];
      this.weakTargets = [];
      this.growTargets = [];
    }
    this.servers.forEach((el) => {
      el.aggiornaServer();
      let processes = this.ns.ps(el.name);
      for (let process of processes) {
        this.aggiornaTargetInterni(process.filename, process.args[0] as string);
      }
    });
  }

  serverLiberi(): boolean {
    return this.servers.find((el) => el.freeRam > 0) !== undefined;
  }

  private aggiornaTargetInterni(scriptName: string, target: string) {
    if (scriptName.indexOf("hack") > 0) {
      if (this.hackTargets.indexOf(target) < 0) this.hackTargets.push(target);
    }
    if (scriptName.indexOf("grow") > 0) {
      if (this.growTargets.indexOf(target) < 0) this.growTargets.push(target);
    }
    if (scriptName.indexOf("weak") > 0) {
      if (this.weakTargets.indexOf(target) < 0) this.weakTargets.push(target);
    }
  }
}
