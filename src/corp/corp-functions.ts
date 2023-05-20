import { NS } from '@ns';
import {
  AGRI_DIV_NAME,
  AGRI_MATERIAL,
  AgriMaterialStage,
  CORP_SETUP_UPGRADES,
  EMP_STATS_CHECK_TIMEOUT,
  EMP_STAT_CHECK_VALUE,
  JOBS,
  MATERIALS,
  PARTY_BUDGET,
  TOB_DIV_NAME,
  TOB_PROD1_NAME,
  TOB_PROD2_NAME,
  UNLOCKS,
  UPGRADES,
} from 'const/corp';
import {
  CORP_AGRI_MAN_STAGE,
  CORP_AGRI_SETUP_STAGE,
  CORP_TOB_MANTAINANCE_STAGE,
  CORP_TOB_MIDGAME_STAGE,
  CORP_TOB_SETUP_STAGE,
  CorpSetupStage,
} from 'corp/corp-stages';

export function checkAndUpdateStage(ns: NS, currentStage: CorpSetupStage | undefined = undefined): CorpSetupStage {
  const lastEmpCheck = currentStage ? currentStage.lastEmpStatsCheck : -1;
  currentStage = checkAgriSetupStage(ns);
  if (currentStage === undefined) {
    currentStage = checkAgriManStage(ns);
  }
  if (currentStage === undefined) {
    currentStage = checkTobSetupStage(ns);
  }
  if (currentStage === undefined) {
    currentStage = checkTobMidGameStage(ns);
  }
  if (currentStage === undefined) {
    currentStage = checkTobManStage(ns);
  }
  // No valid stage found, this shouldn't ever happen, throw error
  if (currentStage === undefined) {
    throw new Error("No valid stage found, this shouldn't ever happen");
  }
  if (lastEmpCheck > -1) currentStage.lastEmpStatsCheck = lastEmpCheck;
  return currentStage;
}

export function checkUpgrades(ns: NS, level: number, upgrades = CORP_SETUP_UPGRADES): boolean {
  const c = ns.corporation;
  for (const upgr of upgrades) {
    if (c.getUpgradeLevel(upgr) < level) {
      return false;
    }
  }
  return true;
}

export function checkAgroWarehouse(ns: NS, level: number): boolean {
  const c = ns.corporation;
  for (const city of Object.values(ns.enums.CityName)) {
    if (c.getWarehouse(AGRI_DIV_NAME, city).level < level) {
      return false;
    }
  }
  return true;
}

export function checkAgroMaterials(ns: NS, stage: AgriMaterialStage): boolean {
  const c = ns.corporation;
  for (const city of Object.values(ns.enums.CityName)) {
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.AIC).qty < stage.aiCores) {
      return false;
    }
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.HDW).qty < stage.hardware) {
      return false;
    }
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.RES).qty < stage.realEstate) {
      return false;
    }
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.ROB).qty < stage.robot) {
      return false;
    }
  }
  return true;
}

export function checkAgroEmployees(ns: NS, moveToRnD = false): boolean {
  const c = ns.corporation;
  for (const city of Object.values(ns.enums.CityName)) {
    const office = c.getOffice(AGRI_DIV_NAME, city);
    if (office.size < 9) return false;
    else if (office.employeeJobs['Research & Development'] > 0 && moveToRnD) return false;
  }
  return true;
}

export function checkTobEmployees(ns: NS, devCityEmp: number): boolean {
  const c = ns.corporation;
  for (const city of Object.values(ns.enums.CityName)) {
    const office = c.getOffice(TOB_DIV_NAME, city);
    if (city === ns.enums.CityName.Aevum && office.size < devCityEmp) return false;
    if (city !== ns.enums.CityName.Aevum && office.size < (devCityEmp > 60 ? devCityEmp - 60 : 9)) return false;
  }
  return true;
}

export function checkEmployeeStats(ns: NS): boolean {
  const c = ns.corporation;
  let avgMor = 0;
  let avgHap = 0;
  let avgEne = 0;
  for (const city of Object.values(ns.enums.CityName)) {
    avgMor += c.getOffice(AGRI_DIV_NAME, city).avgMor;
    avgHap += c.getOffice(AGRI_DIV_NAME, city).avgHap;
    avgEne += c.getOffice(AGRI_DIV_NAME, city).avgEne;
  }
  avgMor /= 6;
  avgHap /= 6;
  avgEne /= 6;
  ns.clearLog();
  ns.print('waiting for employee stats to rise');
  ns.print('   avg morale: ' + avgMor.toFixed(3) + '/97');
  ns.print('avg happiness: ' + avgHap.toFixed(3) + '/97');
  ns.print('   avg energy: ' + avgEne.toFixed(3) + '/97');
  if (avgMor >= EMP_STAT_CHECK_VALUE && avgHap / 6 >= EMP_STAT_CHECK_VALUE && avgEne >= EMP_STAT_CHECK_VALUE) {
    return true;
  }
  return false;
}

export function checkProductAtLeastDevelopment(ns: NS, division: string, name: string) {
  const c = ns.corporation;
  try {
    const prod = c.getProduct(division, name);
    return prod !== undefined;
  } catch (e) {
    return false;
  }
}
export function checkAndSpeedEmpStats(ns: NS, stage: CorpSetupStage) {
  const c = ns.corporation;
  if (Date.now() - stage.lastEmpStatsCheck > 60 * 5 * 1000 && !checkEmployeeStats(ns)) {
    speedEmployeeStats(ns, stage);
  }
}
export function setSubstage(stage: CorpSetupStage, substageIndex: number): CorpSetupStage {
  stage.subStage = stage.subStages[substageIndex];
  return stage;
}

export async function purchaseAgroMaterials(ns: NS, stage: AgriMaterialStage) {
  let buyComplete = checkAgroMaterials(ns, stage);
  const c = ns.corporation;
  const materialMap = [
    {
      material: MATERIALS.AIC,
      value: stage.aiCores,
    },
    {
      material: MATERIALS.HDW,
      value: stage.hardware,
    },
    {
      material: MATERIALS.ROB,
      value: stage.robot,
    },
    {
      material: MATERIALS.RES,
      value: stage.realEstate,
    },
  ];
  while (!buyComplete) {
    while (c.getCorporation().state !== 'EXPORT') {
      //when you make your main script, put things you want to be done
      //potentially multiple times every cycle, like buying upgrades, here.
      await ns.sleep(0);
    }

    while (c.getCorporation().state === 'EXPORT') {
      //same as above
      await ns.sleep(0);
    }
    //and to this part put things you want done exactly once per cycle
    for (const city of Object.values(ns.enums.CityName)) {
      for (const mat of materialMap) {
        const material = c.getMaterial(AGRI_DIV_NAME, city, mat.material);
        if (material.qty < mat.value) {
          const toBuy = mat.value - material.qty;
          c.buyMaterial(AGRI_DIV_NAME, city, mat.material, toBuy / 10);
        } else {
          c.buyMaterial(AGRI_DIV_NAME, city, mat.material, 0);
        }
      }
    }
    buyComplete = checkAgroMaterials(ns, stage);
  }
}

export function speedEmployeeStats(ns: NS, stage: CorpSetupStage) {
  const c = ns.corporation;
  if (stage.lastEmpStatsCheck === -1) {
    stage.lastEmpStatsCheck = Date.now();
  } else if (Date.now() - stage.lastEmpStatsCheck > EMP_STATS_CHECK_TIMEOUT) {
    for (const city of Object.values(ns.enums.CityName)) {
      c.buyCoffee(AGRI_DIV_NAME, city);
      c.throwParty(AGRI_DIV_NAME, city, PARTY_BUDGET);
    }
    stage.lastEmpStatsCheck = -1;
  }
}

export function manageInvestors(ns: NS, minValue: number, round: number): boolean {
  const c = ns.corporation;
  const offer = c.getInvestmentOffer();
  if (offer && offer.round === round && offer.funds > minValue) return c.acceptInvestmentOffer();
  return false;
}

export function manageAevumEmployees(ns: NS, size: number) {
  const c = ns.corporation;
  while (c.hireEmployee(TOB_DIV_NAME, ns.enums.CityName.Aevum)) {}

  const baseline = Math.floor(size / 7);
  const business = Math.floor(baseline / 2);
  let remaining = business + baseline * 3;

  let ops = baseline;
  let eng = baseline;
  let man = baseline;
  let step = 0;
  while (remaining > 0) {
    switch (step) {
      case 0: {
        eng++;
        break;
      }
      case 1: {
        man++;
        break;
      }
      case 2: {
        ops++;
        break;
      }
    }
    remaining--;
    step = step == 2 ? 0 : step++;
  }

  c.setAutoJobAssignment(TOB_DIV_NAME, ns.enums.CityName.Aevum, JOBS.OPS, ops);
  c.setAutoJobAssignment(TOB_DIV_NAME, ns.enums.CityName.Aevum, JOBS.ENG, eng);
  c.setAutoJobAssignment(TOB_DIV_NAME, ns.enums.CityName.Aevum, JOBS.BUS, business);
  c.setAutoJobAssignment(TOB_DIV_NAME, ns.enums.CityName.Aevum, JOBS.MAN, man);
}

// SETUP AGRI CHECK
export function checkAgriSetupStage(ns: NS): CorpSetupStage | undefined {
  ns.print('INFO check agri setup');
  const c = ns.corporation;
  const corp = c.getCorporation();
  let currentStage = undefined;
  if (!corp.divisions.includes(AGRI_DIV_NAME)) {
    return CORP_AGRI_SETUP_STAGE;
  } else if (!c.hasUnlockUpgrade(UNLOCKS.SSU)) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 1);
  } else if (c.getDivision(AGRI_DIV_NAME).cities.length < Object.keys(ns.enums.CityName).length) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 2);
  } else if (c.getDivision(AGRI_DIV_NAME).awareness + c.getDivision(AGRI_DIV_NAME).popularity < 0.1) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 3);
  } else if (!checkAgroWarehouse(ns, 2)) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 4);
  } else if (!checkUpgrades(ns, 2)) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 5);
  } else if (!checkAgroMaterials(ns, AGRI_MATERIAL.stage1)) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 6);
  } else if (!checkEmployeeStats(ns)) {
    currentStage = setSubstage(CORP_AGRI_SETUP_STAGE, 7);
  }
  return currentStage;
}

// MANTAINANCE AGRI CHECK
export function checkAgriManStage(ns: NS): CorpSetupStage | undefined {
  const c = ns.corporation;
  let currentStage = undefined;
  if (c.getInvestmentOffer().round === 1) {
    return CORP_AGRI_MAN_STAGE;
  } else if (!checkAgroEmployees(ns, false)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 1);
  } else if (!checkUpgrades(ns, 10, [UPGRADES.SFA, UPGRADES.SST])) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 2);
  } else if (!checkAgroWarehouse(ns, 9)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 3);
  } else if (!checkAgroMaterials(ns, AGRI_MATERIAL.stage2)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 4);
  } else if (!checkEmployeeStats(ns)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 5);
  } else if (c.getInvestmentOffer().round === 2) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 6);
  } else if (!checkAgroWarehouse(ns, 18)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 7);
  } else if (!checkAgroMaterials(ns, AGRI_MATERIAL.stage3)) {
    currentStage = setSubstage(CORP_AGRI_MAN_STAGE, 8);
  }
  return currentStage;
}

// SETUP TOB CHECK
export function checkTobSetupStage(ns: NS): CorpSetupStage | undefined {
  const c = ns.corporation;
  const corp = c.getCorporation();
  let currentStage = undefined;
  if (!corp.divisions.includes(TOB_DIV_NAME)) {
    return CORP_TOB_SETUP_STAGE;
  } else if (c.getDivision(TOB_DIV_NAME).cities.length < Object.keys(ns.enums.CityName).length) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 1);
  } else if (checkTobEmployees(ns, 30)) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 2);
  } else if (
    c.getDivision(TOB_DIV_NAME).products.length === 0 &&
    !checkProductAtLeastDevelopment(ns, TOB_DIV_NAME, TOB_PROD1_NAME)
  ) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 3);
  } else if (
    !checkUpgrades(ns, 20, [UPGRADES.FWI, UPGRADES.SPI, UPGRADES.NAC, UPGRADES.NNI]) &&
    !checkUpgrades(ns, 30, [UPGRADES.DSE]) &&
    !checkUpgrades(ns, 10, [UPGRADES.PIN])
  ) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 4);
  } else if (!checkProductAtLeastDevelopment(ns, TOB_DIV_NAME, TOB_PROD2_NAME)) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 5);
  } else if (!checkUpgrades(ns, 10, [UPGRADES.WAN])) {
    currentStage = setSubstage(CORP_TOB_SETUP_STAGE, 6);
  }
  return currentStage;
}
export function checkTobMidGameStage(ns: NS): CorpSetupStage | undefined {
  const c = ns.corporation;
  if (c.getDivision(TOB_DIV_NAME).products.length < 3) {
    return CORP_TOB_MIDGAME_STAGE;
  }
  return undefined;
}
// MANTAINANCE TOBACCHI CHECK
export function checkTobManStage(ns: NS): CorpSetupStage | undefined {
  const c = ns.corporation;
  if (c.getDivision(TOB_DIV_NAME).products.length >= 3) return CORP_TOB_MANTAINANCE_STAGE;
  return undefined;
}
