import { NS } from '@ns';
import { ALL_SERVERS_FILENAME, SERVERS_FILENAME } from 'const/files';
import { FileHandler } from 'files/filehandler';
import { ScanResult } from 'scan-and-nuke/scan-result';

/** @param {NS} ns */
export async function main(ns: NS) {
  while (true) {
    ns.disableLog('ALL');
    ns.enableLog('sleep');
    const scanResult: ScanResult = new ScanResult(ns);
    await new FileHandler(ns, SERVERS_FILENAME).write(scanResult.hackable, 'w');
    await new FileHandler(ns, ALL_SERVERS_FILENAME).write(scanResult.allServers, 'w');
    await ns.sleep(60000);
  }
}
