import { NS } from '@ns';
import { BEGINNER_HACK_SCRIPT_NAME } from 'const/files';

/** @param {NS} ns */
export async function main(ns: NS) {
  const myRam = ns.getScriptRam(ns.getScriptName());
  const beginnerScriptRam = ns.getScriptRam(BEGINNER_HACK_SCRIPT_NAME);
  const currentHomeRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home') - myRam;
  const freeThreads = currentHomeRam / beginnerScriptRam;
  ns.spawn(BEGINNER_HACK_SCRIPT_NAME, freeThreads, 'n00dles');
}
