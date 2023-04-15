import { NS } from "@ns";
import { GET_INFO_NAME, MANAGE_ALL_NAME, SCAN_SCRIPT_NAME } from "const/files";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.exec(SCAN_SCRIPT_NAME, "home", 1);
  ns.exec(GET_INFO_NAME, "home", 1);
  ns.spawn(MANAGE_ALL_NAME, 1);
}
