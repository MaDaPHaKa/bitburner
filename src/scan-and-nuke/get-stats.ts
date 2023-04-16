import { NS } from '@ns';
import { SERVERS_DETAIL_FILENAME, SERVERS_FILENAME } from 'const/files';
import { FileHandler } from 'files/filehandler';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { ServerInfo } from 'utils/server-info';
import { HwgwServerInfo } from '/utils/hwgw-server-info';

/** @param {NS} ns */
export async function main(ns: NS) {
  while (true) {
    let handler = new FileHandler(ns, SERVERS_FILENAME);
    const servers = await handler.read();
    let serverInfo: ServerInfo[] = [];
    for (let target of servers) {
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
      const growt = calc.calcolaGrowTime();
      const weakent = calc.calcolaWeakTime();
      const hackA = calc.calcolaHackPerc();
      const hackChance = calc.calcolaHackChance();
      const hackT = calc.calcolaHackTime();
      infoObj.growTm = growt;
      infoObj.weakenTm = weakent;
      infoObj.hackChance = hackChance;
      infoObj.hackValue = hackA;
      infoObj.hackTm = hackT;
      infoObj.prepped = serverSecurity == minSecurity && serverMoney == maxMoney;
      infoObj.calcolaScore();
      serverInfo = [...serverInfo, infoObj];
    }
    handler = new FileHandler(ns, SERVERS_DETAIL_FILENAME);
    await handler.write(serverInfo, 'w');
    await ns.sleep(1000);
  }
}
