import { NS } from "@ns";
import { HWGW_SCRIPT_NAME, XP_FARMER_SERVER_NAME } from "const/files";
import { ServerInfo } from "utils/server-info";
import { loadTargetInfo } from "utils/target-loader";

/** @param {NS} ns */
export async function main(ns: NS) {
  const servers = ns
    .getPurchasedServers()
    .filter((el) => el != XP_FARMER_SERVER_NAME);
  while (true) {
    let serverInfo: ServerInfo[] = (await loadTargetInfo(ns)) as ServerInfo[];
    const toPrep: ServerInfo[] = serverInfo.filter((el) => !el.prepped);
    if (toPrep.length <= 0) {
      servers.unshift("home");
      if (!ns.scriptRunning(HWGW_SCRIPT_NAME, "home"))
        ns.exec(HWGW_SCRIPT_NAME, "home", 1);
    }
    const toBatch: ServerInfo[] = serverInfo.filter((el) => el.prepped);
    await ns.sleep(1000);
  }
}
