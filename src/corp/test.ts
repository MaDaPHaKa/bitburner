import { NS } from '@ns';
import { manageAevumEmployees } from 'corp/corp-functions';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();
  manageAevumEmployees(ns);
}
