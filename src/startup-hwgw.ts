import { NS } from '@ns';
import { HWGW_MANAGER_NAME, LOG_MANAGER, SCAN_SCRIPT_NAME } from 'const/scripts';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.exec(SCAN_SCRIPT_NAME, 'home', 1);
  ns.exec(LOG_MANAGER, 'home', 1);
  ns.spawn(HWGW_MANAGER_NAME, 1);
}
