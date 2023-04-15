import { NS } from "@ns";
import {
  PREP_SERVER_WEAKEN_SCRIPT,
  WG_COST,
  PREP_SERVER_GROW_SCRIPT,
} from "const/files";
import { HwgOpsCalulator } from "utils/hwg-ops-calulator";
import { ServerManager } from "utils/server-manager";
import { ServerInfo } from "utils/server-info";
import { loadTargetInfo } from "utils/target-loader";

export async function main(ns: NS) {
  let toPrep: ServerInfo[] = (
    (await loadTargetInfo(ns)) as ServerInfo[]
  ).filter((el) => !el.prepped);
  while (toPrep.length > 0) {
    const serverMgr: ServerManager = new ServerManager(ns, ["home"]);
    serverMgr.aggiornaUtilizzo();
    for (let target of toPrep) {
      if (!serverMgr.serverLiberi()) continue;
      const calc: HwgOpsCalulator = new HwgOpsCalulator(ns, target);
      if (
        serverMgr.weakTargets.indexOf(target.name) < 0 &&
        target.minSecurity != ns.getServerSecurityLevel(target.name)
      ) {
        const weakThreads = calc.calcolaWeakThread(
          ns.getServer("home").cpuCores
        );
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
    toPrep = ((await loadTargetInfo(ns)) as ServerInfo[]).filter(
      (el) => !el.prepped
    );
    await ns.sleep(60000);
  }
}
