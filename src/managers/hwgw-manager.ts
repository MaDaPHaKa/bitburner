import { NS, NetscriptPort } from '@ns';
import { EMPTY_PORT_DATA, HWGW_COMMON_PORT, HWGW_PORTS, HWGW_PREP_PORTS } from 'const/ports';
import { SERVER_WEAKEN_V2_SCRIPT_NAME } from 'const/scripts';
import { HwgwBatch } from 'hwgw/hwgw-batch';
import { HwgwScorer } from 'hwgw/hwgw-scorer';
import { HwgwServerManager } from 'hwgw/hwgw-server-manager';
import { WgwBatch } from 'hwgw/wgw-batch';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerInfo } from 'utils/server-info';
import { loadTargetInfo } from 'utils/target-loader';
import { HwgwWorkerRes } from '/hwgw/hwgw-res';
import { info, warn } from '/logs/logger';

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
  let preps: WgwBatch[] = [];
  for (const port of HWGW_PORTS) {
    ns.clearPort(port);
  }
  for (const port of HWGW_PREP_PORTS) {
    ns.clearPort(port);
  }
  ns.clearPort(HWGW_COMMON_PORT);
  const protHandle = ns.getPortHandle(HWGW_COMMON_PORT);
  while (true) {
    info(ns, 'cycle start');
    const serverManager: HwgwServerManager = new HwgwServerManager(ns);
    // preps = checkPreppinPort(ns, preps);
    let endedBatches = batches.filter((el) => el.running).map((el) => el.target);
    // checkBatchingPorts(ns, batches);
    const res = checkPort(ns, batches, preps, protHandle);
    batches = res.batches;
    preps = res.preppin;
    endedBatches = endedBatches.filter((el) => batches.find((el2) => el2.target === el && !el2.running) !== undefined);
    const serverInfo: HwgwServerInfo[] = ((await loadTargetInfo(ns)) as ServerInfo[]).map(
      (el) => new HwgwServerInfo(ns, el)
    );
    const desyncs = serverInfo
      .filter((el) => !el.prepped)
      .map((el) => el.name)
      .filter((el) => endedBatches.indexOf(el) !== -1);
    if (desyncs.length > 0) warn(ns, 'desynched servers: ' + JSON.stringify(desyncs));
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
    preps = await prepServers(ns, toPrep, preps, serverManager);
    batches = await batch(ns, toBatch, batches, serverManager);
    if (protHandle.empty()) {
      info(ns, 'await port write');
      await protHandle.nextWrite();
    } else {
      info(ns, 'batch finished before management, wait 1s');
      await ns.sleep(1000);
    }
    // const endTimes = preps
    //   .map((el) => el.endTime)
    //   .concat(batches.filter((el) => el.running).map((el) => el.endTime))
    //   .filter((el) => el > 0);
    // if (endTimes.length > 0) {
    //   const supposedEnd = endTimes.sort((a, b) => a - b)[0] - Date.now() + 5;
    //   const wait = Math.max(2000, supposedEnd);
    //   info(ns, 'wait (supposed): ' + JSON.stringify(supposedEnd));
    //   await ns.sleep(wait);
    // } else {
    //   await ns.sleep(2000);
    // }
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
        batch.endTime = -1;
      }
      portValue = ns.readPort(port) as string;
    }
  }
}

function checkPreppinPort(ns: NS, preppin: WgwBatch[]): WgwBatch[] {
  if (preppin.length <= 0) return preppin;
  for (const port of HWGW_PREP_PORTS) {
    let portValue: string = ns.readPort(port) as string;
    while (portValue !== EMPTY_PORT_DATA) {
      preppin = preppin.filter((el) => el.target != portValue);
      portValue = ns.readPort(port) as string;
    }
  }
  return preppin;
}

function checkPort(
  ns: NS,
  batches: HwgwBatch[],
  preppin: WgwBatch[],
  protHandle: NetscriptPort
): { batches: HwgwBatch[]; preppin: WgwBatch[] } {
  let portValue: string = protHandle.read() as string;
  const ret: { batches: HwgwBatch[]; preppin: WgwBatch[] } = { batches, preppin };
  while (portValue !== EMPTY_PORT_DATA) {
    const res: HwgwWorkerRes = JSON.parse(portValue);
    if (res.type === 'BATCH') {
      const batch = batches.find((el) => el.target === res.target);
      if (batch != undefined) {
        batch.running = false;
        batch.endTime = -1;
      }
    } else {
      preppin = preppin.filter((el) => el.target != res.target);
    }
    portValue = protHandle.read() as string;
  }
  ret.batches = batches;
  ret.preppin = preppin;
  return ret;
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

async function prepServers(
  ns: NS,
  toPrep: HwgwServerInfo[],
  preppin: WgwBatch[],
  serverMgr: HwgwServerManager
): Promise<WgwBatch[]> {
  let portSeed = 1;
  let prepStarted = false;
  for (const daPreparare of toPrep) {
    if (preppin.map((el) => el.target).includes(daPreparare.name)) continue;
    serverMgr.aggiornaUtilizzo();
    if (!serverMgr.serverLiberi()) return preppin;
    const calc: HwgOpsCalulator = new HwgOpsCalulator(ns, daPreparare);
    const weakTime = calc.calcolaWeakTime();
    const growTime = calc.calcolaGrowTime(calc.calcolaHackTime(weakTime));

    const batch: WgwBatch = new WgwBatch(daPreparare.name, portSeed, weakTime, growTime);
    batch.calcolaWgwThreads(ns, daPreparare, calc);

    const ramNecessaria = batch.getNeededRam();
    if (!serverMgr.canRun(ramNecessaria)) {
      continue;
    }
    prepStarted = true;
    serverMgr.avviaWgwBatch(daPreparare.name, batch);
    preppin.push(batch);
    if (portSeed > 4) portSeed = 1;
    else portSeed++;
  }
  // wait a moment to let the prep start and have correct ram info on batching
  if (prepStarted) await ns.sleep(500);
  return preppin;
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
