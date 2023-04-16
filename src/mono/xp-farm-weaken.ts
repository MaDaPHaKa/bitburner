import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  while (true) {
    const target = ns.args[0] as string;
    await ns.weaken(target);
    await ns.sleep(10);
  }
}
