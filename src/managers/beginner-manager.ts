import { NS } from "@ns";
import {
  SERVER_WEAKEN_V2_SCRIPT_NAME,
  XP_FARMER_SERVER_PREFIX,
} from "const/files";
import { ServerInfo } from "utils/server-info";
import { loadTargetInfo, loadTargetNames } from "utils/target-loader";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog("ALL");
  //const servers = ns.args;
  const targets: string[] = await loadTargetNames(ns);
  const targetInfo: ServerInfo[] = (await loadTargetInfo(ns)) as ServerInfo[];
  // const ordinati = targetInfo
  //   .filter((el) => el.cheesyScoreTest > 0)
  //   .sort(function (a, b) {
  //     return b.cheesyScoreTest - a.cheesyScoreTest;
  //   })
  //   .map((el) => el.name);
  const ordinati = [/*"joesguns", "foodnstuff",*/ "n00dles"];
  while (true) {
    const servers = ns
      .getPurchasedServers()
      .filter((el) => el != "home" && el != XP_FARMER_SERVER_PREFIX);
    let i = 0;
    for (let server of servers) {
      checkAndStartBeginnerSingoloTarget(ns, server, ordinati[i]);
      i++;
      if (i >= ordinati.length) i = 0;
    }
    checkAndStartBeginnerHackHome(ns, ordinati[0]);
    checkAutoWeak(ns, targets);
    await ns.sleep(5000);
  }
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

/** @param {NS} ns */
function checkAndStartBeginnerSingoloTarget(
  ns: NS,
  host: string,
  target: string
) {
  const scriptRam = ns.getScriptRam("beginner-hack.js");
  const serverUsedRam = ns.getServerUsedRam(host);
  const serverRam = ns.getServerMaxRam(host);
  const threads = Math.floor((serverRam - serverUsedRam) / scriptRam);
  if (!isNaN(threads) && threads > 0) {
    ns.exec("beginner-hack.js", host, threads, target, threads);
  }
}

/** @param {NS} ns */
function checkAndStartBeginnerHackHome(ns: NS, target: string) {
  const scriptRam = ns.getScriptRam("beginner-hack.js");
  const serverUsedRam = ns.getServerUsedRam("home");
  const serverRam = ns.getServerMaxRam("home") - 4.5;
  const threads = Math.floor((serverRam - serverUsedRam - 50) / scriptRam);
  if (!isNaN(threads) && threads > 0) {
    ns.exec("beginner-hack.js", "home", threads, target, threads);
  }
}
