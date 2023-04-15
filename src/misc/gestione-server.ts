import { NS } from "@ns";
import { SERVER_GB_WANTED, MAX_SERVER_NUM, MAX_RAM } from "const/files";

/** @param {NS} ns */
export async function main(ns: NS) {
  const purch = ns.getPurchasedServers();
  let totalCost = 0;
  for (let server of purch) {
    if (server == "home") continue;
    const serverRam = ns.getServerMaxRam(server);
    totalCost += ns.getPurchasedServerUpgradeCost(server, SERVER_GB_WANTED);
  }
  for (let count = purch.length; count < MAX_SERVER_NUM; count++) {
    totalCost += ns.getPurchasedServerCost(SERVER_GB_WANTED);
  }

  ns.tprint(
    "costo per arrivare a " +
      MAX_SERVER_NUM +
      " server da " +
      SERVER_GB_WANTED +
      " : ",
    ns.formatNumber(totalCost, 3)
  );
  ns.tprint(
    "costo server a massima ram : ",
    ns.formatNumber(ns.getPurchasedServerCost(MAX_RAM), 3)
  );
}
