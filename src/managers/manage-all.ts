import { NS } from '@ns';
import {
  SERVER_GROW_SCRIPT_NAME,
  SERVER_HACK_SCRIPT_NAME,
  SERVER_WEAKEN_SCRIPT_NAME,
  SERVER_WEAKEN_V2_SCRIPT_NAME,
} from 'const/scripts';
import { XP_FARMER_SERVER_PREFIX } from 'const/servers';
import { ServerInfo } from 'utils/server-info';
import { loadTargetInfo } from 'utils/target-loader';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('ALL');
  //const servers = ns.args;
  const targetInfo: ServerInfo[] = (await loadTargetInfo(ns)) as ServerInfo[];
  const ordinati = targetInfo
    .sort(function (a, b) {
      return b.score - a.score;
    })
    .map((el) => el.name);
  while (true) {
    //growRunningServer = checkGrowServer(ns, servers, growRunningServer);
    //checkWeakenServer(ns, servers);
    //checkServer(ns, servers, 'srv-1');
    //checkServer(ns, servers, 'srv-2');
    //checkServer(ns, servers, 'srv-3');
    //checkServer(ns, servers, 'srv-4');
    //checkServer(ns, servers, 'srv-5');
    //checkServer(ns, servers, 'srv-6');
    //checkServer(ns, servers, 'srv-7');
    //checkServer(ns, servers, 'srv-8');
    //checkServer(ns, servers, 'srv-9');
    //checkServer(ns, servers, 'srv-10');
    const servers = ns.getPurchasedServers().filter((el) => el != 'home' && el != XP_FARMER_SERVER_PREFIX);
    let i = 0;
    for (const server of servers) {
      checkServerSingoloTarget(ns, ordinati[i], server);
      i++;
      if (i >= ordinati.length) i = 0;
    }
    if (i >= ordinati.length) i = 0;
    checkAndStartBeginnerHackHome(ns, ordinati[i]);
    checkAutoWeak(ns, ordinati);
    await ns.sleep(5000);
  }
}

function startScriptHost(
  ns: NS,
  host: string,
  target: string,
  script: string,
  otherArgs: (string | number | boolean)[]
) {
  if (!host || !target) return;
  const scriptRam = ns.getScriptRam(script);
  const serverRam = ns.getServerMaxRam(host);
  const threads = Math.floor(serverRam / scriptRam);
  const allArgs = [target, ...otherArgs, threads];
  ns.scp(script, host);
  ns.exec(script, host, threads, ...allArgs);
}

// START SERVER 1

function checkServerSingoloTarget(ns: NS, target: string, server: string) {
  if (!target) return;
  const securityThresh = ns.getServerMinSecurityLevel(target) + 1;
  const serverSec = ns.getServerSecurityLevel(target);
  const secOk = serverSec <= securityThresh;
  const moneyThresh = ns.getServerMaxMoney(target) * 0.9;
  const securityThreshScript = securityThresh;
  //	if (ns.getServerUsedRam(host) > 0) {
  //		if (serverSec < securityThreshScript) {
  //			checkAndKillScriptHost(ns, host, server, SERVER_GROW_SCRIPT_NAME, [securityThreshScript])
  //		} else
  //			return;
  //	}
  const serverMoney = ns.getServerMoneyAvailable(target);
  if (!secOk) {
    startScriptHost(ns, server, target, SERVER_WEAKEN_SCRIPT_NAME, [securityThresh]);
  } else if (serverMoney < moneyThresh) {
    startScriptHost(ns, server, target, SERVER_GROW_SCRIPT_NAME, [moneyThresh, securityThreshScript]);
  } else {
    startScriptHost(ns, server, target, SERVER_HACK_SCRIPT_NAME, [securityThreshScript, moneyThresh]);
  }
}

/** @param {NS} ns */
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

/** @param {NS} ns */
function checkAndStartBeginnerHackHome(ns: NS, target: string) {
  const scriptRam = ns.getScriptRam('beginner-hack.js');
  const serverUsedRam = ns.getServerUsedRam('home');
  const serverRam = ns.getServerMaxRam('home') - 20;
  const threads = Math.floor((serverRam - serverUsedRam) / scriptRam);
  if (!isNaN(threads) && threads > 0) {
    ns.exec('beginner-hack.js', 'home', threads, target);
  }
}
