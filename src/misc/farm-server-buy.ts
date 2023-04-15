import { NS } from "@ns";
import {
  MAX_FARMER_SERVER_NUM,
  MAX_RAM,
  MAX_SERVER_NUM,
  SERVER_GB,
  XP_FARMER_SERVER_PREFIX,
} from "const/files";

/** @param {NS} ns */
export async function main(ns: NS) {
  const purch = ns
    .getPurchasedServers()
    .filter((el) => el.startsWith(XP_FARMER_SERVER_PREFIX));
  for (let count = purch.length; count < MAX_FARMER_SERVER_NUM; count++) {
    //ns.tprint('dry run buy');
    ns.purchaseServer(XP_FARMER_SERVER_PREFIX + (count + 1), MAX_RAM);
  }
  ns.spawn("/prep/prep-servers.js");
}
