import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.exec("/scan-and-nuke/scan-and-update-file.js", "home", 1);
  ns.exec("/scan-and-nuke/get-stats.js", "home", 1);
  ns.spawn("/managers/beginner-manager.js", 1);
}
