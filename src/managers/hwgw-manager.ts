import { NS } from "@ns";
import {
  HWGW_MONEY_PERCENTAGE,
  HWGW_PREP_SCRIPT_NAME,
  HWGW_SERVER_GROW_SCRIPT,
  HWGW_SERVER_HACK_SCRIPT,
  HWGW_SERVER_WEAKEN_SCRIPT,
  H_COST,
  SERVER_WEAKEN_V2_SCRIPT_NAME,
  WG_COST,
  XP_FARMER_SERVER_PREFIX,
} from "const/files";
import { HwgwBatch } from "hwgw/hwgw-batch";
import { HwgOpsCalulator } from "utils/hwg-ops-calulator";
import { ServerInfo } from "utils/server-info";
import { ServerManager } from "utils/server-manager";
import { loadTargetInfo, loadTargetNames } from "utils/target-loader";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog("ALL");
  const servers = ns
    .getPurchasedServers()
    .filter((el) => el != "home" && !el.startsWith(XP_FARMER_SERVER_PREFIX));
  const serverManager: ServerManager = new ServerManager(ns, servers);
  const homeServer: ServerManager = new ServerManager(ns, ["home"]);
  const batchRunning: Map<string, HwgwBatch> = new Map();
  const maxPorts = (await loadTargetNames(ns)).length + 2;
  let preppin: string[] = [];
  for (let i = 1; i <= maxPorts; i++) {
    ns.clearPort(i);
  }
  while (true) {
    const allTargets: string[] = await loadTargetNames(ns);
    checkAutoWeak(ns, allTargets);
    let serverInfo: ServerInfo[] = (await loadTargetInfo(ns)) as ServerInfo[];
    const toPrep: ServerInfo[] = serverInfo.filter(
      (el) => !el.prepped && !batchRunning.has(el.name)
    );
    const toBatch: ServerInfo[] = serverInfo.filter((el) => el.prepped);
    preppin = preppin.filter((el) => !toBatch.map((s) => s.name).includes(el));
    for (let daPreparare of toPrep) {
      if (preppin.includes(daPreparare.name)) continue;
      ns.exec(HWGW_PREP_SCRIPT_NAME, "home", 1, daPreparare.name);
      preppin.push(daPreparare.name);
    }
    for (let target of toBatch) {
      let batch: HwgwBatch | undefined = batchRunning.get(target.name);
      if (batch?.running) {
        ns.enableLog("ALL");
        ns.print(
          "batch running on " + target.name + ", reading port: ",
          batch.batchPort
        );
        const portValue = ns.readPort(batch.batchPort);
        ns.print("port value: ", portValue);
        if (portValue == 1) {
          ns.print("batch completed, starting next");
          batch.running = false;
        } else {
          ns.print("batch still running, next target");
          ns.disableLog("ALL");
        }
        ns.disableLog("ALL");
        continue;
      } else {
        const randomArg = new Date().getTime();
        const calc = new HwgOpsCalulator(ns, target);
        if (batch == undefined) {
          batch = creaBatch(ns, target, batchRunning.size + 1, calc);
          batchRunning.set(target.name, batch);
        } else {
          batch = creaBatch(ns, target, batch.batchPort, calc);
          batchRunning.set(target.name, batch);
        }
        const hackThreads = calc.calcolaHackThread(HWGW_MONEY_PERCENTAGE);
        const homeAvailable = checkHome(ns, target, hackThreads, calc);
        let hackWeakThreads;
        let growThreads;
        let growWeakThreads;
        const hackArgs = [target.name, batch.sleepHack, randomArg];
        const hackWeakArgs = [target.name, batch.sleepWeakHack, randomArg];
        const growArgs = [target.name, batch.sleepGrow, randomArg];
        const growWeakArgs = [
          target.name,
          batch.sleepWeakGrow,
          batch.batchPort,
          randomArg,
        ];
        if (homeAvailable) {
          launchFromHome(
            hackWeakThreads,
            homeAvailable,
            growThreads,
            growWeakThreads,
            serverManager,
            hackThreads,
            hackArgs,
            homeServer,
            hackWeakArgs,
            growArgs,
            growWeakArgs
          );
        } else {
          launchFromServers(
            ns,
            hackWeakThreads,
            hackThreads,
            growThreads,
            calc,
            target,
            growWeakThreads,
            serverManager,
            hackArgs,
            hackWeakArgs,
            growArgs,
            growWeakArgs
          );
        }
        batch.running = true;
      }
    }
    await ns.sleep(1000);
  }
}

function launchFromServers(
  ns: NS,
  hackWeakThreads: any,
  hackThreads: number,
  growThreads: any,
  calc: HwgOpsCalulator,
  target: ServerInfo,
  growWeakThreads: any,
  serverManager: ServerManager,
  hackArgs: (string | number)[],
  hackWeakArgs: (string | number)[],
  growArgs: (string | number)[],
  growWeakArgs: (string | number)[]
) {
  const WEAKEN_PER_THREAD = ns.weakenAnalyze(1);
  const HW_THREADS = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
  const GW_THREADS = ns.growthAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
  hackWeakThreads = Math.ceil(HW_THREADS * hackThreads);
  growThreads = calc.calcolaGrowThreads(
    target.maxMoney * HWGW_MONEY_PERCENTAGE
  );
  growWeakThreads = Math.max(1, Math.ceil(GW_THREADS * growThreads));
  serverManager.avviaHwgwScript(
    HWGW_SERVER_HACK_SCRIPT,
    hackThreads,
    H_COST,
    false,
    ...hackArgs
  );
  serverManager.avviaHwgwScript(
    HWGW_SERVER_WEAKEN_SCRIPT,
    hackWeakThreads,
    WG_COST,
    false,
    ...hackWeakArgs
  );
  serverManager.avviaHwgwScript(
    HWGW_SERVER_GROW_SCRIPT,
    growThreads,
    WG_COST,
    false,
    ...growArgs
  );
  serverManager.avviaHwgwScript(
    HWGW_SERVER_WEAKEN_SCRIPT,
    growWeakThreads,
    WG_COST,
    false,
    ...growWeakArgs
  );
}

function launchFromHome(
  hackWeakThreads: any,
  homeAvailable: {
    growThreads: number;
    weakGrowThreads: number;
    hackWeakThreads: number;
  },
  growThreads: any,
  growWeakThreads: any,
  serverManager: ServerManager,
  hackThreads: number,
  hackArgs: (string | number)[],
  homeServer: ServerManager,
  hackWeakArgs: (string | number)[],
  growArgs: (string | number)[],
  growWeakArgs: (string | number)[]
) {
  hackWeakThreads = homeAvailable.hackWeakThreads;
  growThreads = homeAvailable.growThreads;
  growWeakThreads = homeAvailable.weakGrowThreads;
  if (serverManager.servers.length > 0) {
    serverManager.avviaHwgwScript(
      HWGW_SERVER_HACK_SCRIPT,
      hackThreads,
      H_COST,
      false,
      ...hackArgs
    );
  } else {
    homeServer.avviaHwgwScript(
      HWGW_SERVER_HACK_SCRIPT,
      hackThreads,
      H_COST,
      false,
      ...hackArgs
    );
  }
  homeServer.avviaHwgwScript(
    HWGW_SERVER_WEAKEN_SCRIPT,
    hackWeakThreads,
    WG_COST,
    false,
    ...hackWeakArgs
  );
  homeServer.avviaHwgwScript(
    HWGW_SERVER_GROW_SCRIPT,
    growThreads,
    WG_COST,
    false,
    ...growArgs
  );
  homeServer.avviaHwgwScript(
    HWGW_SERVER_WEAKEN_SCRIPT,
    growWeakThreads,
    WG_COST,
    false,
    ...growWeakArgs
  );
}

function checkHome(
  ns: NS,
  target: ServerInfo,
  hackThreads: number,
  calc: HwgOpsCalulator
):
  | { growThreads: number; weakGrowThreads: number; hackWeakThreads: number }
  | undefined {
  const cores = ns.getServer("home").cpuCores;
  const WEAKEN_PER_THREAD = ns.weakenAnalyze(1, cores);
  const HW_THREADS = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
  const GW_THREADS =
    ns.growthAnalyzeSecurity(1, target.name, cores) / WEAKEN_PER_THREAD;
  const growThreads = calc.calcolaGrowThreads(
    target.maxMoney * HWGW_MONEY_PERCENTAGE,
    cores
  );
  const hackWeakThreads = Math.ceil(HW_THREADS * hackThreads);
  const weakGrowThreads = Math.max(1, Math.ceil(GW_THREADS * growThreads));
  const ramNeeded = (growThreads + hackWeakThreads + weakGrowThreads) * WG_COST;
  if (ramNeeded < ns.getServerMaxRam("home") - ns.getServerUsedRam("home"))
    return {
      growThreads: growThreads,
      weakGrowThreads: weakGrowThreads,
      hackWeakThreads: weakGrowThreads,
    };
  return undefined;
}

function creaBatch(
  ns: NS,
  targetInfo: ServerInfo,
  batchPort: number,
  calc: HwgOpsCalulator
) {
  const hackTime = calc.calcolaHackTime();
  const weakTime = calc.calcolaWeakTime();
  const growTime = calc.calcolaGrowTime();
  return new HwgwBatch(
    targetInfo.name,
    batchPort,
    hackTime,
    weakTime,
    growTime,
    200,
    500
  );
}

function checkAutoWeak(ns: NS, servers: string[]) {
  for (let server of servers) {
    checkAndStartAutoWeak(ns, server);
  }
}
/** @param {NS} ns */
function checkAndStartAutoWeak(ns: NS, server: string) {
  const scriptRam = ns.getScriptRam(SERVER_WEAKEN_V2_SCRIPT_NAME);
  const serverRam = ns.getServerMaxRam(server);
  const threads = Math.floor(serverRam / scriptRam);
  if (threads > 0) {
    if (!ns.isRunning(SERVER_WEAKEN_V2_SCRIPT_NAME, server, server, threads)) {
      ns.scp(SERVER_WEAKEN_V2_SCRIPT_NAME, server);
      ns.exec(SERVER_WEAKEN_V2_SCRIPT_NAME, server, threads, server, threads);
    }
  }
}
