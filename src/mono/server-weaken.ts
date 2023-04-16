import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const secThresh = ns.args[1] as number;
  const numberOfThread = ns.args[2] as number;
  let serverSec = ns.getServerSecurityLevel(target);
  while (serverSec > secThresh) {
    await ns.weaken(target, { threads: numberOfThread });
    serverSec = ns.getServerSecurityLevel(target);
  }
}
