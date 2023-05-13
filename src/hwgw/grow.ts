import { NS } from '@ns';
import { HwgwWorkerProp } from 'hwgw/hwgw-worker-prop';
import { info, warn } from 'logs/logger';

/** @param {NS} ns */
export async function main(ns: NS) {
  const prop: HwgwWorkerProp = JSON.parse(ns.args[0] as string) as HwgwWorkerProp;
  const sleep = prop.scriptEstimatedEnd - prop.scriptExecTime - Date.now();
  if (sleep >= 0) {
    await ns.grow(prop.target, { additionalMsec: sleep });
  } else {
    warn(ns, `${prop.type} ${prop.target}-${prop.iteration}: grow was ${-sleep} ms too late.`);
  }
  const end = Date.now();
  info(
    ns,
    `${prop.type} ${prop.target}-${prop.iteration}: grow finished at ${end.toString().slice(-6)}/${Math.round(
      prop.scriptEstimatedEnd
    )
      .toString()
      .slice(-6)}`
  );
}
