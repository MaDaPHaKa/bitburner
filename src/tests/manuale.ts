import { NS } from '@ns';
import { SERVER_NAME_PREFIX, XP_FARMER_SERVER_PREFIX } from '/const/files';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.tail();

  for (let i = 16; i < 26; i++) {
    const xpNumber: number = i - 15;
    ns.renamePurchasedServer(SERVER_NAME_PREFIX + i, XP_FARMER_SERVER_PREFIX + xpNumber);
  }
  // ns.renamePurchasedServer(XP_FARMER_SERVER_PREFIX + "-6",XP_FARMER_SERVER_PREFIX + "1");
}
