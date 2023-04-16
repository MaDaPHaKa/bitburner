import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  while (true) {
    const target = ns.args[0] as string;
    const numberOfThread = ns.args[1] as number;
    await ns.weaken(target, { threads: numberOfThread });
    await ns.sleep(10);
  }
}
