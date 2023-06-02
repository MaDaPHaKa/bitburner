import { NS } from '@ns';
import { SCRIPT_DELAY } from 'const/hwgw';
import { HwgwServerBatch } from 'hwgw/hwgw-server-batch';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerData } from 'utils/server-data';

export class HwgwBatch {
  target: string;
  tempoHack: number;
  tempoWeak: number;
  tempoGrow: number;
  endTime = -1;
  running = false;

  constructor(target: string, tempoHack: number, tempoWeak: number, tempoGrow: number) {
    this.target = target;
    this.tempoGrow = tempoGrow;
    this.tempoHack = tempoHack;
    this.tempoWeak = tempoWeak;
  }

  creaServerBatch(
    ns: NS,
    server: ServerData,
    target: HwgwServerInfo,
    calc: HwgOpsCalulator,
    iteration = 0,
    scriptDelay = SCRIPT_DELAY
  ): HwgwServerBatch {
    return new HwgwServerBatch(
      this.tempoHack,
      this.tempoWeak,
      this.tempoGrow,
      server,
      ns,
      target,
      calc,
      iteration,
      scriptDelay
    );
  }
}
