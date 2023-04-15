import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  //sleep for given amount
  const sleep = ns.args[1] as number;
  if (sleep) await ns.sleep(sleep);
  //and then grow!
  await ns.grow(ns.args[0] as string);
}
