import { NS } from '@ns';
import { HwgwBatchScorer } from 'hwgw/hwgw-batch-scorer';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerData } from 'utils/server-data';
import { info } from '/logs/logger';

export class HwgwScorer {
  target: string;
  singleBatchScore: HwgwBatchScorer[] = [];
  score = -1;

  constructor(ns: NS, target: HwgwServerInfo, servers: ServerData[]) {
    this.target = target.name;
    const calc = new HwgOpsCalulator(ns, target);
    const weakTime = calc.calcolaWeakTime();
    for (const server of servers) {
      const batchScore = new HwgwBatchScorer(ns, weakTime, server.getMaxRam(), target, calc, server.cores);
      if (batchScore.canRun) this.singleBatchScore.push(batchScore);
    }
    if (this.singleBatchScore.length > 1) {
      const money = this.singleBatchScore.map((el) => el.batchMoney).reduce((partialSum, a) => partialSum + a, 0);
      const time = this.singleBatchScore.map((el) => el.weakGrowEndTime).sort((a, b) => b - a)[0] - Date.now() + 10;
      this.score = money / time;
    }
  }
}
