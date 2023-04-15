import { NS } from "@ns";
import {
  MAX_RAM,
  SERVER_WEAKEN_V2_SCRIPT_NAME,
  WG_COST,
  XP_FARMER_SERVER_NAME,
  XP_FARM_SCRIPT_NAME,
} from "const/files";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  const servers = ns.getPurchasedServers();
  if (servers.indexOf(XP_FARMER_SERVER_NAME) < 0) {
    ns.renamePurchasedServer(
      servers[servers.length - 1],
      XP_FARMER_SERVER_NAME
    );
  }
  ns.killall(XP_FARMER_SERVER_NAME);

  let serverRamOk = ns.getServerMaxRam(XP_FARMER_SERVER_NAME) == MAX_RAM;
  if (
    !serverRamOk &&
    ns.getPurchasedServerUpgradeCost(XP_FARMER_SERVER_NAME, MAX_RAM) <
      ns.getServerMoneyAvailable("home")
  ) {
    serverRamOk = ns.upgradePurchasedServer(XP_FARMER_SERVER_NAME, MAX_RAM);
  }
  if (serverRamOk) {
    ns.exec(
      XP_FARM_SCRIPT_NAME,
      XP_FARMER_SERVER_NAME,
      Math.floor(MAX_RAM / WG_COST),
      "foodnstuff"
    );
  }
}
