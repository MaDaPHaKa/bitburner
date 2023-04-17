import { NS } from '@ns';
import {
  EMPTY_PORT_DATA,
  HWGW_PORTS,
  HWGW_PREP_PORTS,
  HWGW_PREP_SCRIPT_NAME,
  SERVER_WEAKEN_V2_SCRIPT_NAME,
} from 'const/files';
import { HwgwBatch } from 'hwgw/hwgw-batch';
import { HwgwServerManager } from 'hwgw/hwgw-server-manager';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerInfo } from 'utils/server-info';
import { loadTargetInfo } from 'utils/target-loader';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('getServerUsedRam');
  ns.disableLog('getServerMaxRam');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerSecurityLevel');
  ns.disableLog('getServerMinSecurityLevel');
  ns.disableLog('getServerMoneyAvailable');
  ns.disableLog('getServerMaxMoney');
  ns.disableLog('getHackingLevel');
  ns.disableLog('exec');
  ns.disableLog('sleep');

  let batches: Map<string, HwgwBatch> = new Map();
  let preppin: string[] = [];
  for (let port of HWGW_PORTS) {
    ns.clearPort(port);
  }
  for (let port of HWGW_PREP_PORTS) {
    ns.clearPort(port);
  }
  while (true) {
    const serverManager: HwgwServerManager = new HwgwServerManager(ns);
    const serverInfo: HwgwServerInfo[] = ((await loadTargetInfo(ns)) as ServerInfo[]).map(
      (el) => new HwgwServerInfo(ns, el)
    );
    checkAutoWeak(
      ns,
      serverInfo.map((el) => el.name)
    );
    preppin = checkPreppinPort(ns, preppin);
    batches = checkBatchingPorts(ns, batches);

    const toPrep: HwgwServerInfo[] = serverInfo.filter(
      (el) => !el.prepped && (!batches.has(el.name) || !batches.get(el.name)?.running)
    );
    const toBatch: HwgwServerInfo[] = serverInfo.filter((el) => el.prepped);

    await prepServers(toPrep, preppin, ns);
    batch(ns, toBatch, batches, serverManager);
    await ns.sleep(2000);
  }
}

// -----------------------------------------------------
// -------------- PORT CHECKING START ------------------
// -----------------------------------------------------

function checkBatchingPorts(ns: NS, batches: Map<string, HwgwBatch>): Map<string, HwgwBatch> {
  if (batches.size <= 0) return batches;
  for (let port of HWGW_PORTS) {
    let portValue: string = ns.readPort(port) as string;
    while (portValue !== EMPTY_PORT_DATA) {
      const batch = batches.get(portValue);
      if (batch != undefined) batch.running = false;
      portValue = ns.readPort(port) as string;
    }
  }
  return batches;
}

function checkPreppinPort(ns: NS, preppin: string[]): string[] {
  if (preppin.length <= 0) return preppin;
  for (let port of HWGW_PREP_PORTS) {
    let portValue: string = ns.readPort(port) as string;
    while (portValue !== EMPTY_PORT_DATA) {
      preppin = preppin.filter((el) => el != portValue);
      portValue = ns.readPort(port) as string;
    }
  }
  return preppin;
}

// -----------------------------------------------------
// -------------- PORT CHECKING END ------------------
// ------------------------------------------------------

// ---------------------------------------------------------
// -------------- BATCHING FUNCTION START ------------------
// ---------------------------------------------------------

function batch(ns: NS, toBatch: HwgwServerInfo[], batches: Map<string, HwgwBatch>, serverManager: HwgwServerManager) {
  let portSeed = 1;
  for (let target of toBatch) {
    let batch: HwgwBatch | undefined = batches.get(target.name);
    if (batch == undefined || !batch.running) {
      const calc = new HwgOpsCalulator(ns, target);
      if (batch == undefined) {
        batch = creaBatch(portSeed, calc);
        batches.set(target.name, batch);
      } else {
        batch = creaBatch(portSeed, calc);
        batches.set(target.name, batch);
      }
      batch.calcolaHwgwThreads(ns, target, calc);
      serverManager.avviaHwgwBatch(target, batch, calc, new Date().getTime());
      // batch.running = true;
      portSeed++;
    }
  }
}

function creaBatch(batchPort: number, calc: HwgOpsCalulator) {
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

async function prepServers(toPrep: HwgwServerInfo[], preppin: string[], ns: NS) {
  let portSeed = 1;
  for (let daPreparare of toPrep) {
    if (preppin.includes(daPreparare.name)) continue;
    ns.exec(HWGW_PREP_SCRIPT_NAME, 'home', 1, daPreparare.name, portSeed);
    preppin.push(daPreparare.name);
    portSeed++;
  }
  if (toPrep.length > 0) await ns.sleep(1000);
}

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
