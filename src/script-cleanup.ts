import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const scripts = ns.ls('home', 'corp/');
  ns.clearLog();
  ns.tail();
  ns.print(scripts);
  scripts.forEach((el) => ns.rm(el));
}
