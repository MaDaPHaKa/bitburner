import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  //sleep for given amount
  const sleep = ns.args[1] as number;
  const writePort = ns.args[2] as number;
  if (sleep) await ns.sleep(sleep);
  //and then grow!
  await ns.weaken(ns.args[0] as string);
  if (writePort) ns.tryWritePort(writePort, 1);
}
