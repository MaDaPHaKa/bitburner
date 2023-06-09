export const CORP_NAME = 'Totally Legit Corporation';
export const AGRI_DIV_NAME = 'Veggies';
export const TOB_DIV_NAME = 'Totally Not Ganja';
export const TOB_PROD1_NAME = 'Totally Not White Widow';
export const TOB_PROD2_NAME = 'Totally Not NY Diesel';
export const TOB_PROD3_NAME = 'Totally Not Cheese';
export const TOB_PROD4_NAME = 'Totally Not Lemon Haze';
export const TOB_PROD5_NAME = 'Totally Not Super Skunk';

export const ROUND_1_MIN_AMOUNT = 21e10; //210b
export const ROUND_2_MIN_AMOUNT = 5e12; //5t
export const ROUND_3_MIN_AMOUNT = 8e14; //800t
export const ROUND_4_MIN_AMOUNT = 5e17; //500q

export const BN_VAL_MULTI = 1;
export const VAL_MULTI_EQ = 0;

export const EMP_STAT_CHECK_VALUE = 97;
export const EMP_STATS_CHECK_TIMEOUT = 30000;
export const PARTY_BUDGET = 5e5;
export const ADV_OR_HIRE_FUNDS_CHECK_MULTIPLIER = 0.5;

export const TOBACCHI_MIN_INVESTMENT_VALUE = 1e9;

export const TOBACCHI_LAB_POINT_THRESHOLD = 1e4;
export const TOBACCHI_MK_POINT_THRESHOLD = 15e4;
export const TOBACCHI_RES_MIN_THRESHOLD = 1e5;

// setup\adjustment chec state 0=never sold, 1=first setup, 2=cyclic check and adjustment, 3=complete
export const TOB_PROD_CHECK_START = 0;
export const TOB_PROD_CHECK_FIRST = 1;
export const TOB_PROD_CHECK_CYCLE = 2;
export const TOB_PROD_CHECK_END = 3;

export const TOB_PROD_ADJUST_START = 0;
export const TOB_PROD_ADJUST_INC = 1;
export const TOB_PROD_ADJUST_LOW = 2;
export const TOB_PROD_ADJUST_END = 3;

// prod setup state, 0=before bisection, 1=first bisection, 2=bisection loop, 3=complete
export const TOB_PROD_SETUP_START = 0;
export const TOB_PROD_SETUP_FIRST = 1;
export const TOB_PROD_SETUP_LOOP = 2;
export const TOB_PROD_SETUP_END = 3;

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
export enum UNLOCKS {
  EXP = 'Export',
  SSU = 'Smart Supply',
  MDD = 'Market Research - Demand',
  MDC = 'Market Data - Competition',
  VEC = 'VeChain',
  SAD = 'Shady Accounting',
  GOV = 'Government Partnership',
}
export const enum UPGRADES {
  SFA = 'Smart Factories',
  SST = 'Smart Storage',
  FWI = 'FocusWires',
  NAC = 'Neural Accelerators',
  SPI = 'Speech Processor Implants',
  NNI = 'Nuoptimal Nootropic Injector Implants',
  WAN = 'Wilson Analytics',
  DSE = 'DreamSense',
  PIN = 'Project Insight',
  ABC = 'ABC SalesBots',
}

export enum CorpResearchName {
  RES_LAB = 'Hi-Tech R&D Laboratory',
  AUTO_BREW = 'AutoBrew',
  AUTO_PARTY = 'AutoPartyManager',
  AUTO_DRUG = 'Automatic Drug Administration',
  CPH4 = 'CPH4 Injections',
  DRONES = 'Drones',
  DRONES_ASSEMBLY = 'Drones - Assembly',
  DRONES_TRANS = 'Drones - Transport',
  GO_JUICE = 'Go-Juice',
  HR_BUDDY_REC = 'HRBuddy-Recruitment',
  HR_BUDDY_TR = 'HRBuddy-Training',
  MKT1 = 'Market-TA.I',
  MKT2 = 'Market-TA.II',
  OVERCLOCK = 'Overclock',
  SELF_CORR_ASS = 'Self-Correcting Assemblers',
  STI_MU = 'Sti.mu',
  UPG_CAP1 = 'uPgrade: Capacity.I',
  UPG_CAP2 = 'uPgrade: Capacity.II',
  UPG_DASH = 'uPgrade: Dashboard',
  UPG_FULC = 'uPgrade: Fulcrum',
  SUDO_ASSIST = 'sudo.Assist',
}

export const CORP_SETUP_UPGRADES = [UPGRADES.SFA, UPGRADES.FWI, UPGRADES.NAC, UPGRADES.NNI, UPGRADES.NAC];
export const CORP_OP_UPGRADES = [
  UPGRADES.SFA,
  UPGRADES.SST,
  UPGRADES.SPI,
  UPGRADES.PIN,
  UPGRADES.ABC,
  UPGRADES.FWI,
  UPGRADES.NNI,
  UPGRADES.NAC,
];
export const CORP_OP_UPGRADES_LEVEL = 3450;
export const CORP_OP_UPGRADES_UNLOCK_AT = 1e70;

export class AgriMaterials {
  stage1: AgriMaterialStage = new AgriMaterialStage(125, 0, 75, 27000);
  stage2: AgriMaterialStage = new AgriMaterialStage(2800, 96, 2520, 146400);
  stage3: AgriMaterialStage = new AgriMaterialStage(9300, 726, 6270, 230400);
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
