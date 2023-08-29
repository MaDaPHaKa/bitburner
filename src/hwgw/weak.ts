import { NS } from '@ns';
import { HwgwWorkerRes } from 'hwgw/hwgw-res';
import { HwgwWorkerProp } from 'hwgw/hwgw-worker-prop';
import { info, warn } from 'logs/logger';

/** @param {NS} ns */
export async function main(ns: NS) {
  const prop: HwgwWorkerProp = JSON.parse(ns.args[0] as string) as HwgwWorkerProp;
  const sleep = prop.scriptEstimatedEnd - prop.scriptExecTime - Date.now();
  if (sleep >= 0) {
    await ns.weaken(prop.target, { additionalMsec: sleep });
  } else if (prop.debugWarn) {
    warn(ns, `${prop.type} ${prop.target}-${prop.iteration}: weak-${prop.weakType} was ${-sleep} ms too late.`);
  }
  ns.atExit(() => {
    const end = Date.now();
    if (prop.debug) {
      info(
        ns,
        `${prop.type} ${prop.target}-${prop.iteration}: weak-${prop.weakType} finished at ${end
          .toString()
          .slice(-6)}/${Math.round(prop.scriptEstimatedEnd).toString().slice(-6)}`
      );
    }
    if (prop.writePort > -1) {
      const res = JSON.stringify(new HwgwWorkerRes(prop.target, prop.type));
      let writeOk = ns.tryWritePort(prop.writePort, res);
      while (!writeOk) {
        writeOk = ns.tryWritePort(prop.writePort, res);
        ns.sleep(5);
      }
    }
  });
}
