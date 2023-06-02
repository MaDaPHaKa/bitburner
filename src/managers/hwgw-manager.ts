import { NS } from '@ns';
import { EMPTY_PORT_DATA, HWGW_PORTS, HWGW_PREP_PORTS } from 'const/ports';
import { SERVER_WEAKEN_V2_SCRIPT_NAME } from 'const/scripts';
import { HwgwBatch } from 'hwgw/hwgw-batch';
import { HwgwScorer } from 'hwgw/hwgw-scorer';
import { HwgwServerManager } from 'hwgw/hwgw-server-manager';
import { WgwBatch } from 'hwgw/wgw-batch';
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

  let batches: HwgwBatch[] = [];
  let preppin: string[] = [];
  for (const port of HWGW_PORTS) {
    ns.clearPort(port);
  }
  for (const port of HWGW_PREP_PORTS) {
    ns.clearPort(port);
  }
  while (true) {
    const serverManager: HwgwServerManager = new HwgwServerManager(ns);
    preppin = checkPreppinPort(ns, preppin);
    checkBatchingPorts(ns, batches);
    const serverInfo: HwgwServerInfo[] = ((await loadTargetInfo(ns)) as ServerInfo[]).map(
      (el) => new HwgwServerInfo(ns, el)
    );
    checkAutoWeak(
      ns,
      serverInfo.map((el) => el.name)
    );
    const scorer = serverInfo
      .filter((el) => el.hackChance >= 0.999)
      .map((el) => new HwgwScorer(ns, el, serverManager.servers.slice().concat(serverManager.homeServer)));
    serverInfo.forEach((el) => {
      const score = scorer.find((sc) => sc.target === el.name);
      el.newHwgwScore = score ? score.score : -1;
    });
    const toPrep: HwgwServerInfo[] = serverInfo
      .filter(
        (el) =>
          !el.prepped &&
          (!batches.filter((bel) => bel.target === el.name) || !batches.find((bel) => bel.target === el.name)?.running)
      )
      .sort(function (a, b) {
        return b.hwgwScore - a.hwgwScore;
      });
    const toBatch: HwgwServerInfo[] = serverInfo
      .filter((el) => el.prepped)
      .sort(function (a, b) {
        return b.newHwgwScore - a.newHwgwScore;
      });
    await prepServers(ns, toPrep, preppin, serverManager);
    batches = await batch(ns, toBatch, batches, serverManager);
    if (batches.length > 0) {
      const wait = Math.max(1, batches.sort((a, b) => a.endTime - b.endTime)[0].endTime - Date.now() + 5);
      await ns.sleep(wait);
    } else {
      await ns.sleep(2000);
    }
  }
}

// -----------------------------------------------------
// -------------- PORT CHECKING START ------------------
// -----------------------------------------------------

function checkBatchingPorts(ns: NS, batches: HwgwBatch[]): void {
  if (batches.length <= 0) return;
  for (const port of HWGW_PORTS) {
    let portValue: string = ns.readPort(port) as string;
    while (portValue !== EMPTY_PORT_DATA) {
      const batch = batches.find((el) => el.target === portValue);
      if (batch != undefined) {
        batch.running = false;
      }
      portValue = ns.readPort(port) as string;
    }
  }
}

function checkPreppinPort(ns: NS, preppin: string[]): string[] {
  if (preppin.length <= 0) return preppin;
  for (const port of HWGW_PREP_PORTS) {
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
  batches: HwgwBatch[],
  serverManager: HwgwServerManager
): Promise<HwgwBatch[]> {
  let portSeed = 1;
  for (const target of toBatch) {
    let batch: HwgwBatch | undefined = batches.find((el) => el.target === target.name);
    if (batch == undefined || !batch.running) {
      const calc = new HwgOpsCalulator(ns, target);
      batch = creaBatch(target.name, calc);
      const index = batches.map((el) => el.target).indexOf(batch.target);
      batch.running = await serverManager.avviaHwgwBatch(target, batch, calc, new Date().getTime(), portSeed);
      if (index >= 0) {
        batches[index] = batch;
      } else batches.push(batch);
      if (portSeed > 4) portSeed = 1;
      else portSeed++;
    }
  }
  return batches;
}

function creaBatch(target: string, calc: HwgOpsCalulator) {
  const weakTime = calc.calcolaWeakTime();
  const hackTime = calc.calcolaHackTime(weakTime);
  const growTime = calc.calcolaGrowTime(hackTime);
  return new HwgwBatch(target, hackTime, weakTime, growTime);
}
// -------------------------------------------------------
// -------------- BATCHING FUNCTION END ------------------
// -------------------------------------------------------

// --------------------------------------------------------
// -------------- PREPPIN FUNCTION START ------------------
// --------------------------------------------------------

async function prepServers(ns: NS, toPrep: HwgwServerInfo[], preppin: string[], serverMgr: HwgwServerManager) {
  let portSeed = 1;
  let prepStarted = false;
  for (const daPreparare of toPrep) {
    if (preppin.includes(daPreparare.name)) continue;
    serverMgr.aggiornaUtilizzo();
    if (!serverMgr.serverLiberi()) return;
    const calc: HwgOpsCalulator = new HwgOpsCalulator(ns, daPreparare);
    const weakTime = calc.calcolaWeakTime();
    const growTime = calc.calcolaGrowTime(calc.calcolaHackTime(weakTime));

    const batch: WgwBatch = new WgwBatch(portSeed, weakTime, growTime);
    batch.calcolaWgwThreads(ns, daPreparare, calc);

    const ramNecessaria = batch.getNeededRam();
    if (!serverMgr.canRun(ramNecessaria)) {
      continue;
    }
    prepStarted = true;
    serverMgr.avviaWgwBatch(daPreparare.name, batch);
    preppin.push(daPreparare.name);
    if (portSeed > 4) portSeed = 1;
    else portSeed++;
  }
  // wait a moment to let the prep start and have correct ram info on batching
  if (prepStarted) await ns.sleep(500);
}

// ------------------------------------------------------
// -------------- PREPPIN FUNCTION END ------------------
// ------------------------------------------------------

// ---------------------------------------------------------
// -------------- AUTOWEAK FUNCTION START ------------------
// ---------------------------------------------------------

function checkAutoWeak(ns: NS, servers: string[]) {
  for (const server of servers) {
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
