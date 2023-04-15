import { NS } from "@ns";
import { ServerInfo } from "utils/server-info";
import { loadTargetInfo } from "utils/target-loader";
import { HwgOpsCalulator } from "utils/hwg-ops-calulator";
import { ServerManager } from "utils/server-manager";
import {
  PREP_SERVER_GROW_SCRIPT,
  PREP_SERVER_WEAKEN_SCRIPT,
  WG_COST,
  XP_FARMER_SERVER_NAME,
} from "const/files";

/** @param {NS} ns */
export async function main(ns: NS) {
  const servers = ns
    .getPurchasedServers()
    .filter((el) => el != XP_FARMER_SERVER_NAME);
  while (true) {
    let serverInfo: ServerInfo[] = (await loadTargetInfo(ns)) as ServerInfo[];
    const toPrep: ServerInfo[] = serverInfo.filter((el) => !el.prepped);
    if (toPrep.length <= 0) servers.unshift("home");
    else prepServers(ns, toPrep);
    const toBatch: ServerInfo[] = serverInfo.filter((el) => el.prepped);
    await ns.sleep(1000);
  }
}

function prepServers(ns: NS, toPrep: ServerInfo[]): void {
  const serverMgr: ServerManager = new ServerManager(ns, ["home"]);
  serverMgr.aggiornaUtilizzo();
  for (let target of toPrep) {
    if (!serverMgr.serverLiberi()) continue;
    const calc: HwgOpsCalulator = new HwgOpsCalulator(ns, target);
    if (
      serverMgr.weakTargets.indexOf(target.name) < 0 &&
      target.minSecurity != ns.getServerSecurityLevel(target.name)
    ) {
      const weakThreads = calc.calcolaWeakThread(ns.getServer("home").cpuCores);
      serverMgr.avviaScript(
        PREP_SERVER_WEAKEN_SCRIPT,
        weakThreads,
        WG_COST,
        target.name
      );
    } else if (
      serverMgr.growTargets.indexOf(target.name) < 0 &&
      ns.getServerMoneyAvailable(target.name) != target.maxMoney
    ) {
      const growThreads = calc.calcolaGrowThreads(
        ns.getServer("home").cpuCores
      );
      serverMgr.avviaScript(
        PREP_SERVER_GROW_SCRIPT,
        growThreads,
        WG_COST,
        target.name
      );
    }
    serverMgr.aggiornaUtilizzo();
  }
}
