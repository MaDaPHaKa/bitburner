import { NS } from "@ns";
import { ServerInfo } from "/utils/server-info";
import { loadTargetInfo } from "/utils/target-loader";

/** @param {NS} ns */
export async function main(ns: NS) {
  const servers = ns.getPurchasedServers();
  while (true) {
    let serverInfo: ServerInfo[] = (await loadTargetInfo(ns)) as ServerInfo[];
    const toPrep: ServerInfo[] = serverInfo.filter((el) => !el.prepped);
    const toBatch: ServerInfo[] = serverInfo.filter((el) => el.prepped);
    await ns.sleep(1000);
  }
}
