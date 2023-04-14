import { NS, Server } from "@ns";
import {
  PREP_SERVER_GROW_SCRIPT,
  PREP_SERVER_HACK_SCRIPT,
  PREP_SERVER_WEAKEN_SCRIPT,
  SERVERS_DETAIL_FILENAME,
  SERVERS_FILENAME,
  SERVER_WEAKEN_V2_SCRIPT_NAME,
} from "const/files";
import { FileHandler } from "files/filehandler";
import * as calculators from "utils/calculation-utils";
import { ServerInfo } from "utils/server-info";
import { ServerManager } from "utils/server-manager";

/** @param {NS} ns */
export async function main(ns: NS) {
  const debug = ns.args[0] ? true : false;
  //ns.disableLog("ALL");
  ns.disableLog("sleep");
  ns.disableLog("getServerMaxRam");
  ns.disableLog("getServerUsedRam");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerMaxMoney");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getHackingLevel");
  ns.disableLog("exec");
  if (debug) ns.tail();
  const servers: string[] = ns.getPurchasedServers();
  servers.push("home");
  const serverManager: ServerManager = new ServerManager(ns, servers);
  while (true) {
    const allTargets: string[] = await new FileHandler(
      ns,
      SERVERS_FILENAME
    ).read();
    const targetInfo: ServerInfo[] = (
      (await new FileHandler(
        ns,
        SERVERS_DETAIL_FILENAME
      ).read()) as ServerInfo[]
    ).filter((el) => el.cheesyScoreTest > 0);
    const toPrep = targetInfo
      .filter((el) => !el.prepped)
      .sort(function (a, b) {
        return b.cheesyScoreTest - a.cheesyScoreTest;
      });
    let prepped: ServerInfo[] = targetInfo.filter((el) => el.prepped);
    serverManager.aggiornaUtilizzo(true);
    if (debug) {
      ns.print("servers: ", servers);
      ns.print("server manager: ", serverManager);
    }
    if (prepped.length > 0) {
      prepped = prepped
        .sort(function (a, b) {
          return b.cheesyScoreTest - a.cheesyScoreTest;
        })
        .filter((el) => serverManager.hackTargets.indexOf(el.name) < 0);
      for (let prep of prepped) {
        launchHack(ns, serverManager, prep, debug);
      }
    }
    if (serverManager.serverLiberi()) {
      const weakCost = ns.getScriptRam(PREP_SERVER_WEAKEN_SCRIPT);
      const growCost = ns.getScriptRam(PREP_SERVER_GROW_SCRIPT);
      for (let target of toPrep) {
        prepTarget(ns, target, serverManager, weakCost, growCost, debug);
        if (!serverManager.serverLiberi()) break;
      }
    }
    if (!debug) checkAutoWeak(ns, allTargets);
    await ns.sleep(5000);
    if (debug) break;
  }
}

/**
 *
 * @param {NS} ns
 * @param servers
 * @param target
 * @returns true if server list is still usable, false otherwise
 */
function launchHack(
  ns: NS,
  serverManager: ServerManager,
  target: ServerInfo,
  debug = false
): ServerManager {
  const scriptRam = ns.getScriptRam(PREP_SERVER_HACK_SCRIPT);
  const hackThreadNeeded = calculators.calcolaThreadHack(ns, target, debug);
  serverManager.avviaScript(
    PREP_SERVER_HACK_SCRIPT,
    hackThreadNeeded,
    scriptRam,
    target.name,
    debug
  );
  return serverManager;
}

/** @param {NS} ns */
function prepTarget(
  ns: NS,
  target: ServerInfo,
  serverManager: ServerManager,
  weakCost: number,
  growCost: number,
  debug = false
) {
  if (serverManager.weakTargets.indexOf(target.name) < 0) {
    const weakThreadNeeded = calculators.calcolaThreadWeak(ns, target, debug);
    serverManager.avviaScript(
      PREP_SERVER_WEAKEN_SCRIPT,
      weakThreadNeeded,
      weakCost,
      target.name,
      debug
    );
  }

  if (serverManager.growTargets.indexOf(target.name) < 0) {
    const growThreadNeeded = calculators.calcolaThreadGrow(ns, target, debug);
    const weakThreadCompensationNeeded =
      calculators.calcolaWeakThreadPerGrow(growThreadNeeded);
    serverManager.avviaScript(
      PREP_SERVER_GROW_SCRIPT,
      growThreadNeeded,
      growCost,
      target.name,
      debug
    );
    serverManager.avviaScript(
      PREP_SERVER_WEAKEN_SCRIPT,
      weakThreadCompensationNeeded,
      weakCost,
      target.name,
      debug
    );
  }
  return serverManager;
}

/** @param {NS} ns */
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