import { NS } from "@ns";
import {
  MAX_RAM,
  SERVER_WEAKEN_V2_SCRIPT_NAME,
  WG_COST,
  XP_FARMER_SERVER_PREFIX,
  XP_FARM_SCRIPT_NAME,
} from "const/files";
import { loadTargetInfo } from "/utils/target-loader";
import { ServerInfo } from "/utils/server-info";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  const servers = ns
    .getPurchasedServers()
    .filter((el) => el.startsWith(XP_FARMER_SERVER_PREFIX));
  const targets = ((await loadTargetInfo(ns)) as ServerInfo[]).sort(function (
    a,
    b
  ) {
    return b.farmScore - a.farmScore;
  });
  let i = 0;
  for (let farmer of servers) {
    ns.exec(
      XP_FARM_SCRIPT_NAME,
      farmer,
      Math.floor(MAX_RAM / WG_COST),
      targets[i].name
    );
    i++;
  }
}
