import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const target = ns.args[0] as string;
  const moneyThresh = ns.args[1] as number;
  const secThresh = ns.args[2] as number;
  const numberOfThread = ns.args[3] as number;
  let serverMoney = ns.getServerMoneyAvailable(target);
  let serverSec = ns.getServerSecurityLevel(target);
  while (serverMoney < moneyThresh && serverSec < secThresh) {
    // If the server's money is less than our threshold, grow it
    await ns.grow(target, { threads: numberOfThread });
    serverMoney = ns.getServerMoneyAvailable(target);
    serverSec = ns.getServerSecurityLevel(target);
  }
}
