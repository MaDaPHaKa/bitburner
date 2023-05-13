import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const sleep = (ns.args[1] as number) || 1;
  await ns.hack(ns.args[0] as string, { additionalMsec: sleep });
}
