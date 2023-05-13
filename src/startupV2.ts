import { NS } from '@ns';
import { GET_INFO_NAME, MANAGERV2_NAME, SCAN_SCRIPT_NAME } from 'const/scripts';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.exec(SCAN_SCRIPT_NAME, 'home', 1);
  ns.spawn(MANAGERV2_NAME, 1);
}
