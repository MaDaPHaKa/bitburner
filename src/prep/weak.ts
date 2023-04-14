import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  const target: string = ns.args[0] as string;
  const threads: number = ns.args[1] as number;
  await ns.weaken(target, { threads: threads });
  await ns.sleep(1000);
}
