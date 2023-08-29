export class HwgwWorkerRes {
  target: string;
  type: 'BATCH' | 'PREP';
  constructor(target: string, type: 'BATCH' | 'PREP') {
    this.target = target;
    this.type = type;
  }
}
