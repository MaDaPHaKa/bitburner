import { NS } from '@ns';
import { BEGINNER_HACK_SCRIPT_NAME, BITNODE_MANAGER_NAME, SERVER_WEAKEN_V2_SCRIPT_NAME } from 'const/scripts';
import { ServerInfo } from '/utils/server-info';
import { loadTargetInfo, loadTargetNames } from '/utils/target-loader';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  const targets: string[] = await loadTargetNames(ns);
  checkAutoWeak(ns, targets);
  const myRam = ns.getScriptRam(BITNODE_MANAGER_NAME);
  const beginnerScriptRam = ns.getScriptRam(BEGINNER_HACK_SCRIPT_NAME);
  const currentHomeRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home') + myRam;
  const bestTarget = ((await loadTargetInfo(ns)) as ServerInfo[]).sort(function (a, b) {
    return b.score - a.score;
  })[0];
  ns.print('currentRam', currentHomeRam);
  ns.print('script ram', beginnerScriptRam);
  const freeThreads = Math.floor(currentHomeRam / beginnerScriptRam);
  ns.spawn(BEGINNER_HACK_SCRIPT_NAME, freeThreads, 'n00dles');
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
