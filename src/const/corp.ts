export const CORP_NAME = 'Totally Legit Corporation';
export const AGRI_DIV_NAME = 'Veggies';
export const TOB_DIV_NAME = 'Totally Not Ganja';

export const enum JOBS {
  OPS = 'Operations',
  ENG = 'Engineer',
  BUS = 'Business',
  MAN = 'Management',
  RND = 'Research & Development',
}
export const enum MATERIALS {
  HDW = 'Hardware',
  ROB = 'Robots',
  AIC = 'AI Cores',
  RES = 'Real Estate',
}
export const enum UPGRADES {
  SFA = 'Smart Factories',
  SST = 'Smart Storage',
  FWI = 'FocusWires',
  NAC = 'Neural Accelerators',
  SPI = 'Speech Processor Implants',
  NNI = 'Nuoptimal Nootropic Injector Implants',
  WAN = 'Wilson Analytics',
  SSU = 'Smart Supply',
}

export const CORP_SETUP_UPGRADES = [UPGRADES.SFA, UPGRADES.FWI, UPGRADES.NAC, UPGRADES.NNI, UPGRADES.NAC];

export class AgriMaterials {
  stage1: AgriMaterialStage = new AgriMaterialStage(125, 0, 75, 27000);
  stage2: AgriMaterialStage = new AgriMaterialStage(2675, 96, 2445, 119400);
  stage3: AgriMaterialStage = new AgriMaterialStage(6500, 630, 3750, 84000);
}

export class AgriMaterialStage {
  hardware: number;
  robot: number;
  aiCores: number;
  realEstate: number;
  constructor(hardware: number, robot: number, aiCores: number, realEstate: number) {
    this.hardware = hardware;
    this.robot = robot;
    this.aiCores = aiCores;
    this.realEstate = realEstate;
  }
}

export const AGRI_MATERIAL = new AgriMaterials();
