import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  //sleep for given amount
  const sleep = (ns.args[1] as number) || 1;
  await ns.sleep(sleep);
  //and then hack!
  await ns.hack(ns.args[0] as string);
}
