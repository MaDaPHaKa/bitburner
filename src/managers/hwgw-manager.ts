import { NS } from '@ns';
import {
  EMPTY_PORT_DATA,
  HWGW_MONEY_PERCENTAGE,
  HWGW_PORTS,
  HWGW_PREP_PORT,
  HWGW_PREP_SCRIPT_NAME,
  HWGW_SERVER_GROW_SCRIPT,
  HWGW_SERVER_HACK_SCRIPT,
  HWGW_SERVER_WEAKEN_SCRIPT,
  H_COST,
  SERVER_WEAKEN_V2_SCRIPT_NAME,
  WG_COST,
  XP_FARMER_SERVER_PREFIX,
} from 'const/files';
import { HwgwBatch } from 'hwgw/hwgw-batch';
import { HomeServerManager } from 'utils/home-server-manager';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerInfo } from 'utils/server-info';
import { ServerManager } from 'utils/server-manager';
import { loadTargetInfo, loadTargetNames } from 'utils/target-loader';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('ALL');
  let batchRunning: Map<string, HwgwBatch> = new Map();
  let preppin: string[] = [];
  for (let port of HWGW_PORTS) {
    ns.clearPort(port);
  }
  while (true) {
    const servers = ns.getPurchasedServers().filter((el) => el != 'home' && !el.startsWith(XP_FARMER_SERVER_PREFIX));
    const serverManager: ServerManager = new ServerManager(ns, servers);
    const homeServer: HomeServerManager = new HomeServerManager(ns);
    const allTargets: string[] = await loadTargetNames(ns);
    checkAutoWeak(ns, allTargets);
    preppin = checkPreppinPort(ns, preppin);
    batchRunning = checkBatchingPorts(ns, batchRunning);

    let serverInfo: HwgwServerInfo[] = ((await loadTargetInfo(ns)) as ServerInfo[]).map(
      (el) => new HwgwServerInfo(ns, el)
    );

    const toPrep: HwgwServerInfo[] = serverInfo.filter(
      (el) => !el.prepped && (!batchRunning.has(el.name) || !batchRunning.get(el.name)?.running)
    );
    const toBatch: HwgwServerInfo[] = serverInfo.filter((el) => el.prepped);

    for (let daPreparare of toPrep) {
      if (preppin.includes(daPreparare.name)) continue;
      ns.exec(HWGW_PREP_SCRIPT_NAME, 'home', 1, daPreparare.name);
      preppin.push(daPreparare.name);
    }
    batch(ns, toBatch, batchRunning, homeServer, serverManager);
    await ns.sleep(1000);
  }
}

// -----------------------------------------------------
// -------------- PORT CHECKING START ------------------
// -----------------------------------------------------

function checkBatchingPorts(ns: NS, batchRunning: Map<string, HwgwBatch>): Map<string, HwgwBatch> {
  if (batchRunning.size <= 0) return batchRunning;
  for (let port of HWGW_PORTS) {
    let portValue: string = ns.readPort(port) as string;
    while (portValue !== EMPTY_PORT_DATA) {
      const batch = batchRunning.get(portValue);
      if (batch != undefined) batch.running = false;
      portValue = ns.readPort(port) as string;
    }
  }
  return batchRunning;
}

function checkPreppinPort(ns: NS, preppin: string[]): string[] {
  if (preppin.length <= 0) return preppin;
  let portValue: string = ns.readPort(HWGW_PREP_PORT) as string;
  while (portValue !== EMPTY_PORT_DATA) {
    preppin = preppin.filter((el) => el != portValue);
    portValue = ns.readPort(HWGW_PREP_PORT) as string;
  }
  return preppin;
}

// -----------------------------------------------------
// -------------- PORT CHECKING START ------------------
// ------------------------------------------------------

// ---------------------------------------------------------
// -------------- BATCHING FUNCTION START ------------------
// ---------------------------------------------------------

function batch(
  ns: NS,
  toBatch: HwgwServerInfo[],
  batchRunning: Map<string, HwgwBatch>,
  homeServer: HomeServerManager,
  serverManager: ServerManager
) {
  let portSeed = 1;
  for (let target of toBatch) {
    let batch: HwgwBatch | undefined = batchRunning.get(target.name);
    if (batch == undefined || !batch.running) {
      const calc = new HwgOpsCalulator(ns, target);
      if (batch == undefined) {
        batch = creaBatch(ns, target, portSeed, calc);
        batchRunning.set(target.name, batch);
      } else {
        batch = creaBatch(ns, target, portSeed, calc);
        batchRunning.set(target.name, batch);
      }
      startBatch(ns, target, batch, calc, homeServer, serverManager);
    }
    portSeed++;
  }
}

function startBatch(
  ns: NS,
  target: HwgwServerInfo,
  batch: HwgwBatch,
  calc: HwgOpsCalulator,
  homeServer: HomeServerManager,
  serverManager: ServerManager
) {
  const randomArg = new Date().getTime();
  const hackThreads = calc.calcolaHackThread(HWGW_MONEY_PERCENTAGE);
  batch.hackThreads = hackThreads;
  const homeAvailable = checkHome(ns, target, batch, calc);

  const hackArgs = [target.name, batch.sleepHack, randomArg];
  const hackWeakArgs = [target.name, batch.sleepWeakHack, randomArg];
  const growArgs = [target.name, batch.sleepGrow, randomArg];
  const growWeakArgs = [target.name, batch.sleepWeakGrow, batch.batchPort, randomArg];
  if (homeAvailable) {
    launchFromHome(batch, homeServer, serverManager, hackArgs, hackWeakArgs, growArgs, growWeakArgs);
  } else {
    launchFromServers(batch, serverManager, hackArgs, hackWeakArgs, growArgs, growWeakArgs);
  }
  batch.running = true;
}

function launchFromServers(
  batch: HwgwBatch,
  serverManager: ServerManager,
  hackArgs: (string | number)[],
  hackWeakArgs: (string | number)[],
  growArgs: (string | number)[],
  growWeakArgs: (string | number)[]
) {
  serverManager.avviaHwgwScript(HWGW_SERVER_HACK_SCRIPT, batch.hackThreads, H_COST, false, ...hackArgs);
  serverManager.avviaHwgwScript(HWGW_SERVER_WEAKEN_SCRIPT, batch.hackWeakThreads, WG_COST, false, ...hackWeakArgs);
  serverManager.avviaHwgwScript(HWGW_SERVER_GROW_SCRIPT, batch.growThreads, WG_COST, false, ...growArgs);
  serverManager.avviaHwgwScript(HWGW_SERVER_WEAKEN_SCRIPT, batch.growWeakThreads, WG_COST, false, ...growWeakArgs);
}

function launchFromHome(
  batch: HwgwBatch,
  homeServer: HomeServerManager,
  serverManager: ServerManager,
  hackArgs: (string | number)[],
  hackWeakArgs: (string | number)[],
  growArgs: (string | number)[],
  growWeakArgs: (string | number)[]
) {
  if (serverManager.servers.length > 0) {
    serverManager.avviaHwgwScript(HWGW_SERVER_HACK_SCRIPT, batch.hackThreads, H_COST, false, ...hackArgs);
  } else {
    homeServer.avviaHwgwScript(HWGW_SERVER_HACK_SCRIPT, batch.hackThreads, H_COST, false, ...hackArgs);
  }
  homeServer.avviaHwgwScript(HWGW_SERVER_WEAKEN_SCRIPT, batch.hackWeakThreads, WG_COST, false, ...hackWeakArgs);
  homeServer.avviaHwgwScript(HWGW_SERVER_GROW_SCRIPT, batch.growThreads, WG_COST, false, ...growArgs);
  homeServer.avviaHwgwScript(HWGW_SERVER_WEAKEN_SCRIPT, batch.growWeakThreads, WG_COST, false, ...growWeakArgs);
}

function checkHome(ns: NS, target: HwgwServerInfo, batch: HwgwBatch, calc: HwgOpsCalulator): boolean {
  // calcolo thread usando i core HOME
  const cores = ns.getServer('home').cpuCores;
  let WEAKEN_PER_THREAD = ns.weakenAnalyze(1, cores);
  let HW_THREADS = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
  let GW_THREADS = ns.growthAnalyzeSecurity(1, target.name, cores) / WEAKEN_PER_THREAD;
  let growThreads = calc.calcolaGrowThreads(target.maxMoney * HWGW_MONEY_PERCENTAGE, cores);
  let hackWeakThreads = Math.ceil(HW_THREADS * batch.hackThreads);
  let growWeakThreads = Math.max(1, Math.ceil(GW_THREADS * growThreads));
  const ramNeeded = (growThreads + hackWeakThreads + growWeakThreads) * WG_COST;
  //se ho abbastanza ram lancio da home
  if (ramNeeded < ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) {
    batch.growThreads = growThreads;
    batch.growWeakThreads = growWeakThreads;
    batch.hackWeakThreads = hackWeakThreads;
    return true;
  } else {
    //se non ho abbastanza ram ricalcolo i thread sui server normali
    WEAKEN_PER_THREAD = ns.weakenAnalyze(1);
    HW_THREADS = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
    GW_THREADS = ns.growthAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
    hackWeakThreads = Math.ceil(HW_THREADS * batch.hackThreads);
    growThreads = calc.calcolaGrowThreads(target.maxMoney * HWGW_MONEY_PERCENTAGE);
    growWeakThreads = Math.max(1, Math.ceil(GW_THREADS * growThreads));
    batch.growThreads = growThreads;
    batch.growWeakThreads = growWeakThreads;
    batch.hackWeakThreads = hackWeakThreads;
    return false;
  }
}

function creaBatch(ns: NS, targetInfo: HwgwServerInfo, batchPort: number, calc: HwgOpsCalulator) {
  const hackTime = calc.calcolaHackTime();
  const weakTime = calc.calcolaWeakTime();
  const growTime = calc.calcolaGrowTime();
  return new HwgwBatch(batchPort, hackTime, weakTime, growTime, 200, 500);
}
// -------------------------------------------------------
// -------------- BATCHING FUNCTION END ------------------
// -------------------------------------------------------

// --------------------------------------------------------
// -------------- PREPPIN FUNCTION START ------------------
// --------------------------------------------------------

// ------------------------------------------------------
// -------------- PREPPIN FUNCTION END ------------------
// ------------------------------------------------------

// ---------------------------------------------------------
// -------------- AUTOWEAK FUNCTION START ------------------
// ---------------------------------------------------------

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

// -------------------------------------------------------
// -------------- AUTOWEAK FUNCTION END ------------------
// -------------------------------------------------------
