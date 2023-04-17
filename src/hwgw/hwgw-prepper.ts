import { NS } from '@ns';
import { XP_FARMER_SERVER_PREFIX } from 'const/files';
import { HwgwServerManager } from 'hwgw/hwgw-server-manager';
import { WgwBatch } from 'hwgw/wgw-batch';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerInfo } from 'utils/server-info';
import { loadTargetInfo } from 'utils/target-loader';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.enableLog('exec');
  const toPrep = ns.args[0] as string;
  const portSeed = ns.args[1] != undefined ? (ns.args[1] as number) : new Date().getTime();
  const target: HwgwServerInfo = new HwgwServerInfo(
    ns,
    ((await loadTargetInfo(ns)) as ServerInfo[]).filter((el) => el.name == toPrep)[0]
  );
  const serverMgr: HwgwServerManager = new HwgwServerManager(ns);
  serverMgr.aggiornaUtilizzo();
  if (!serverMgr.serverLiberi()) return;

  const calc: HwgOpsCalulator = new HwgOpsCalulator(ns, target);
  const weakTime = calc.calcolaWeakTime();
  const growTime = calc.calcolaGrowTime();

  const batch: WgwBatch = new WgwBatch(portSeed, weakTime, growTime);
  batch.calcolaWgwThreads(ns, target, calc);
  serverMgr.avviaWgwBatch(target.name, batch);
}
