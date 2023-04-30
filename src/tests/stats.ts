import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  ns.print('bitnodeN: ', ns.getPlayer().bitNodeN);
  // ns.print('karma: ', ns.heart.break());
  ns.print('ppl killed: ', ns.getPlayer().numPeopleKilled);
}
