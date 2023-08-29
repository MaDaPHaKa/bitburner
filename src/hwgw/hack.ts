import { NS } from '@ns';
import { HwgwWorkerProp } from 'hwgw/hwgw-worker-prop';
import { warn, info } from '/logs/logger';

/** @param {NS} ns */
export async function main(ns: NS) {
  const prop: HwgwWorkerProp = JSON.parse(ns.args[0] as string) as HwgwWorkerProp;
  const sleep = prop.scriptEstimatedEnd - prop.scriptExecTime - Date.now();
  if (sleep >= 0) {
    await ns.hack(prop.target, { additionalMsec: sleep });
  } else if (prop.debugWarn) {
    warn(ns, `${prop.type} ${prop.target}-${prop.iteration}: hack was ${-sleep} ms too late.`);
  }
  const end = Date.now();
  if (prop.debug) {
    info(
      ns,
      `${prop.type} ${prop.target}-${prop.iteration}: hack finished at ${end.toString().slice(-6)}/${Math.round(
        prop.scriptEstimatedEnd
      )
        .toString()
        .slice(-6)}`
    );
  }
}
