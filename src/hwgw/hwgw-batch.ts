import { NS } from '@ns';
import { HwgwServerBatch } from 'hwgw/hwgw-server-batch';
import { HwgOpsCalulator } from 'utils/hwg-ops-calulator';
import { HwgwServerInfo } from 'utils/hwgw-server-info';
import { ServerData } from 'utils/server-data';

export class HwgwBatch {
  tempoHack: number;
  tempoWeak: number;
  tempoGrow: number;
  running = false;

  constructor(tempoHack: number, tempoWeak: number, tempoGrow: number) {
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
    scriptDelay = 20
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
