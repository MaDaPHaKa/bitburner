import { NS } from '@ns';

/** @param {NS} ns */
export async function main(ns: NS) {
  const hasFormulas = ns.fileExists('formulas.exe', 'home');
  ns.tail();
  ns.print('ho formulas: ', hasFormulas);
}
