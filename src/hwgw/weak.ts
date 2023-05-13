import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const sleep = (ns.args[1] as number) || 1;
  const writePort = ns.args[2] as number;
  await ns.weaken(ns.args[0] as string, { additionalMsec: sleep });
  ns.atExit(() => {
    if (writePort) ns.tryWritePort(writePort, ns.args[0] as string);
  });
}
