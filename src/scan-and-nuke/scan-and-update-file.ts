import { NS } from '@ns';
import { ALL_SERVERS_FILENAME, SERVERS_DETAIL_FILENAME, SERVERS_FILENAME } from 'const/files';
import { FileHandler } from 'files/filehandler';
import { ScanResult } from 'scan-and-nuke/scan-result';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerInfo } from 'utils/server-info';

/** @param {NS} ns */
export async function main(ns: NS) {
  const lastScanRun = Date.now();
  let scanResult: ScanResult = await scan(ns);
  while (true) {
    ns.disableLog('ALL');
    if (Date.now() - lastScanRun > 60000) {
      scanResult = await scan(ns);
    }
    await getStats(ns, scanResult.hackable);
    await ns.sleep(60000);
  }
}

async function scan(ns: NS): Promise<ScanResult> {
  const scanResult: ScanResult = new ScanResult(ns);
  await new FileHandler(ns, SERVERS_FILENAME).write(scanResult.hackable, 'w');
  await new FileHandler(ns, ALL_SERVERS_FILENAME).write(scanResult.allServers, 'w');
  return scanResult;
}

async function getStats(ns: NS, targets: string[]): Promise<void> {
  let serverInfo: ServerInfo[] = [];
  for (const target of targets) {
    const minSecurity = ns.getServerMinSecurityLevel(target);
    const maxMoney = ns.getServerMaxMoney(target);
    const serverMoney = ns.getServerMoneyAvailable(target);
    const serverSecurity = ns.getServerSecurityLevel(target);
    const hackReq = ns.getServerRequiredHackingLevel(target);
    const infoObj = new ServerInfo();
    infoObj.name = target;
    infoObj.minSecurity = minSecurity;
    infoObj.maxMoney = maxMoney;
    infoObj.minHackLevel = hackReq;
    infoObj.currHackLevel = ns.getHackingLevel();
    const tempInfo: HwgwServerInfo = new HwgwServerInfo(ns, infoObj);
    const calc: HwgOpsCalulator = new HwgOpsCalulator(ns, tempInfo);
    infoObj.hackXp = calc.calcolaHackXp();
    const weakent = calc.calcolaWeakTime();
    const hackA = calc.calcolaHackPerc();
    const hackChance = calc.calcolaHackChance();
    infoObj.weakenTm = weakent;
    infoObj.hackChance = hackChance;
    infoObj.hackValue = hackA;
    infoObj.prepped = serverSecurity == minSecurity && serverMoney == maxMoney;
    infoObj.calcolaScore();
    serverInfo = [...serverInfo, infoObj];
  }
  const handler = new FileHandler(ns, SERVERS_DETAIL_FILENAME);
  await handler.write(serverInfo, 'w');
}
