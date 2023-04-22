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
import { WgwBatch } from '/hwgw/wgw-batch';

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

  let batches: Map<string, HwgwBatch> = new Map<string, HwgwBatch>();
  let preppin: string[] = [];
  for (let port of HWGW_PORTS) {
    ns.clearPort(port);
  }
  for (let port of HWGW_PREP_PORTS) {
    ns.clearPort(port);
  }
  while (true) {
    const serverManager: HwgwServerManager = new HwgwServerManager(ns);
    preppin = checkPreppinPort(ns, preppin);
    checkBatchingPorts(ns, batches);
    const serverInfo: HwgwServerInfo[] = ((await loadTargetInfo(ns)) as ServerInfo[]).map(
      (el) => new HwgwServerInfo(ns, el)
    );
    // ns.print('lista full servers: ', serverInfo);
    // ns.print('preppin: ', preppin);
    checkAutoWeak(
      ns,
      serverInfo.map((el) => el.name)
    );

    const toPrep: HwgwServerInfo[] = serverInfo.filter(
      (el) => !el.prepped && (!batches.has(el.name) || !batches.get(el.name)?.running)
    );
    const toBatch: HwgwServerInfo[] = serverInfo
      .filter((el) => el.prepped)
      .sort(function (a, b) {
        return b.hwgwScore - a.hwgwScore;
      });
    await prepServers(ns, toPrep, preppin, serverManager);
    batches = await batch(ns, toBatch, batches, serverManager);
    await ns.sleep(2000);
  }
}

// -----------------------------------------------------
// -------------- PORT CHECKING START ------------------
// -----------------------------------------------------

function checkBatchingPorts(ns: NS, batches: Map<string, HwgwBatch>): void {
  if (batches.size <= 0) return;
  for (let port of HWGW_PORTS) {
    let portValue: string = ns.readPort(port) as string;
    while (portValue !== EMPTY_PORT_DATA) {
      const batch = batches.get(portValue);
      if (batch != undefined) {
        batch.running = false;
      }
      portValue = ns.readPort(port) as string;
    }
  }
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

async function batch(
  ns: NS,
  toBatch: HwgwServerInfo[],
  batches: Map<string, HwgwBatch>,
  serverManager: HwgwServerManager
): Promise<Map<string, HwgwBatch>> {
  let portSeed = 1;
  for (let target of toBatch) {
    let batch: HwgwBatch | undefined = batches.get(target.name);
    if (batch == undefined || !batch.running) {
      const calc = new HwgOpsCalulator(ns, target);
      batch = creaBatch(calc);
      batch.running = await serverManager.avviaHwgwBatch(target, batch, calc, new Date().getTime(), portSeed);
      batches = batches.set(target.name, batch);
      portSeed++;
      await ns.sleep(1);
    }
  }
  return batches;
}

function creaBatch(calc: HwgOpsCalulator) {
  const hackTime = calc.calcolaHackTime();
  const weakTime = calc.calcolaWeakTime();
  const growTime = calc.calcolaGrowTime();
  return new HwgwBatch(hackTime, weakTime, growTime);
}
// -------------------------------------------------------
// -------------- BATCHING FUNCTION END ------------------
// -------------------------------------------------------

// --------------------------------------------------------
// -------------- PREPPIN FUNCTION START ------------------
// --------------------------------------------------------

async function prepServers(ns: NS, toPrep: HwgwServerInfo[], preppin: string[], serverMgr: HwgwServerManager) {
  let portSeed = 1;
  for (let daPreparare of toPrep) {
    if (preppin.includes(daPreparare.name)) continue;
    serverMgr.aggiornaUtilizzo();
    if (!serverMgr.serverLiberi()) return;

    const calc: HwgOpsCalulator = new HwgOpsCalulator(ns, daPreparare);
    const weakTime = calc.calcolaWeakTime();
    const growTime = calc.calcolaGrowTime();

    const batch: WgwBatch = new WgwBatch(portSeed, weakTime, growTime);
    batch.calcolaWgwThreads(ns, daPreparare, calc);

    const ramNecessaria = batch.getNeededRam();
    if (!serverMgr.canRun(ramNecessaria)) return;
    serverMgr.avviaWgwBatch(daPreparare.name, batch);
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
