import { NS } from "@ns";
import {
  BEGINNER_MANAGER_NAME,
  GET_INFO_NAME,
  SCAN_SCRIPT_NAME,
} from "const/files";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.exec(SCAN_SCRIPT_NAME, "home", 1);
  ns.exec(GET_INFO_NAME, "home", 1);
  ns.spawn(BEGINNER_MANAGER_NAME, 1);
}
