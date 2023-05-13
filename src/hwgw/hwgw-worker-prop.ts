export class HwgwWorkerProp {
  target: string;
  scriptExecTime: number;
  scriptEstimatedEnd: number;
  iteration: number;
  writePort: number = -1;
  weakType: 1 | 2 | undefined;
  type: 'BATCH' | 'PREP';
  constructor(
    target: string,
    scriptExecTime: number,
    scriptEstimatedEnd: number,
    iteration: number,
    type: 'BATCH' | 'PREP'
  ) {
    this.target = target;
    this.scriptEstimatedEnd = scriptEstimatedEnd;
    this.scriptExecTime = scriptExecTime;
    this.iteration = iteration;
    this.type = type;
  }
}
