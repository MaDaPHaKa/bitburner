import { NS } from '@ns';
import { HWGW_PREP_PORT, HWGW_SERVER_GROW_SCRIPT, HWGW_SERVER_WEAKEN_SCRIPT, WG_COST } from 'const/files';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { ServerInfo } from 'utils/server-info';
import { ServerManager } from 'utils/server-manager';
import { loadTargetInfo } from 'utils/target-loader';
import { HwgwServerInfo } from 'utils/hwgw-server-info';

export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.enableLog('exec');
  const toPrep = ns.args[0] as string;
  const target: HwgwServerInfo = new HwgwServerInfo(
    ns,
    ((await loadTargetInfo(ns)) as ServerInfo[]).filter((el) => el.name == toPrep)[0]
  );
  const serverMgr: ServerManager = new ServerManager(ns, ['home']);
  serverMgr.aggiornaUtilizzo();
  if (!serverMgr.serverLiberi()) return;
  const calc: HwgOpsCalulator = new HwgOpsCalulator(ns, target);
  const cores = ns.getServer('home').cpuCores;
  const WEAKEN_PER_THREAD = ns.weakenAnalyze(1, cores);
  const GW_THREADS = ns.growthAnalyzeSecurity(1, target.name, cores) / WEAKEN_PER_THREAD;
  const growThreads = calc.calcolaGrowThreads(undefined, cores);
  const growWeakThreads = Math.max(1, Math.ceil(GW_THREADS * growThreads));
  const weakThreads = Math.max(1, calc.calcolaWeakThread(cores));
  const weakTime = calc.calcolaWeakTime();
  const growTime = calc.calcolaGrowTime();
  const sleepGrow = Math.max(1, Math.ceil(weakTime - growTime));
  const endGrow = sleepGrow + growTime;
  const sleepWeakGrow = Math.max(1, Math.ceil(endGrow - weakTime));
  serverMgr.avviaHwgwScript(HWGW_SERVER_WEAKEN_SCRIPT, weakThreads, WG_COST, false, ...[target.name]);
  serverMgr.avviaHwgwScript(HWGW_SERVER_GROW_SCRIPT, growThreads, WG_COST, false, ...[target.name, sleepGrow]);
  serverMgr.avviaHwgwScript(
    HWGW_SERVER_WEAKEN_SCRIPT,
    growWeakThreads,
    WG_COST,
    false,
    ...[target.name, sleepWeakGrow, HWGW_PREP_PORT]
  );
}
