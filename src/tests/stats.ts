import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  ns.print('bitnodeN: ', ns.getPlayer().bitNodeN);
  // ns.print('karma: ', ns.heart.break());
  ns.print('ppl killed: ', ns.getPlayer().numPeopleKilled);
  // ns.print('has corp: ', ns.corporation);
  // ns.print('corp: ', ns.corporation.getCorporation());
  // ns.print('corp warehouse: ', ns.corporation.getWarehouse('AllNatural I Swear ;)','Sector-12'));
}
