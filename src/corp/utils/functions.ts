import { Corporation, CorporationInfo, NS } from '@ns';
import { AGRI_DIV_NAME, AgriMaterialStage, CORP_SETUP_UPGRADES, EMP_STATS_CHECK_TIMEOUT, EMP_STAT_CHECK_VALUE, JOBS, MATERIALS, PARTY_BUDGET, TOB_DIV_NAME } from 'const/corp';
import { checkAgriManStage, checkAgriSetupStage } from 'corp/agri/checks';
import { checkTobManStage, checkTobMidGameStage, checkTobSetupStage } from 'corp/tobacchi/checks';
import { CORP_TOB_SETUP_STAGE, CorpSetupStage } from 'corp/utils/stages';

export function checkAndUpdateStage(
  ns: NS,
  c: Corporation,
  corp: CorporationInfo,
  currentStage: CorpSetupStage | undefined = undefined
): CorpSetupStage {
  const lastEmpCheck = currentStage ? currentStage.lastEmpStatsCheck : -1;
  currentStage = checkAgriSetupStage(ns, c, corp);
  if (currentStage === undefined) {
    currentStage = checkAgriManStage(ns, c);
  }
  if (currentStage === undefined) currentStage = CORP_TOB_SETUP_STAGE;
  currentStage = checkTobSetupStage(ns, c, corp);
  if (currentStage === undefined) {
    currentStage = checkTobMidGameStage(ns, c);
  }
  if (currentStage === undefined) {
    currentStage = checkTobManStage(ns, c);
  }
  // No valid stage found, this shouldn't ever happen, throw error
  if (currentStage === undefined) {
    throw new Error("No valid stage found, this shouldn't ever happen");
  }
  if (lastEmpCheck > -1)
    currentStage.lastEmpStatsCheck = lastEmpCheck;
  return currentStage;
}

export function checkUpgrades(c: Corporation, level: number, upgrades = CORP_SETUP_UPGRADES): boolean {
  for (const upgr of upgrades) {
    if (c.getUpgradeLevel(upgr) < level) {
      return false;
    }
  }
  return true;
}

export function checkAgroWarehouse(ns: NS, c: Corporation, level: number): boolean {
  for (const city of Object.values(ns.enums.CityName)) {
    if (c.getWarehouse(AGRI_DIV_NAME, city).level < level) {
      return false;
    }
  }
  return true;
}

export function checkAgroMaterials(ns: NS, c: Corporation, stage: AgriMaterialStage): boolean {
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

export function checkAgroEmployees(ns: NS, c: Corporation, moveToRnD = false): boolean {
  for (const city of Object.values(ns.enums.CityName)) {
    const office = c.getOffice(AGRI_DIV_NAME, city);
    if (office.size < 9) return false;
    else if (office.employeeJobs['Research & Development'] > 0 && moveToRnD) return false;
  }
  return true;
}

export function checkTobEmployees(ns: NS, c: Corporation, devCityEmp: number): boolean {
  for (const city of Object.values(ns.enums.CityName)) {
    const office = c.getOffice(TOB_DIV_NAME, city);
    if (city === ns.enums.CityName.Aevum && office.size < devCityEmp) return false;
    if (city !== ns.enums.CityName.Aevum && office.size < (devCityEmp > 60 ? devCityEmp - 60 : 9)) return false;
  }
  return true;
}

export function checkEmployeeStats(ns: NS, c: Corporation): boolean {
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

export function checkProductAtLeastDevelopment(c: Corporation, division: string, name: string) {
  try {
    const prod = c.getProduct(division, name);
    return prod !== undefined;
  } catch (e) {
    return false;
  }
}
export function checkAndSpeedEmpStats(ns: NS, c: Corporation, stage: CorpSetupStage) {
  if (Date.now() - stage.lastEmpStatsCheck > 60 * 5 * 1000 && !checkEmployeeStats(ns, c)) {
    speedEmployeeStats(ns, c, stage);
  }
}
export function setSubstage(stage: CorpSetupStage, substageIndex: number): CorpSetupStage {
  stage.subStage = stage.subStages[substageIndex];
  return stage;
}

export function purchaseAgroMaterials(ns: NS, c: Corporation, stage: AgriMaterialStage) {
  for (const city of Object.values(ns.enums.CityName)) {
    let material = c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.AIC);
    if (material.qty < stage.aiCores) {
      const toBuy = stage.aiCores - material.qty;
      c.bulkPurchase(AGRI_DIV_NAME, city, MATERIALS.AIC, toBuy);
    }
    material = c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.HDW);
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.HDW).qty < stage.hardware) {
      const toBuy = stage.aiCores - material.qty;
      c.bulkPurchase(AGRI_DIV_NAME, city, MATERIALS.HDW, toBuy);
    }
    material = c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.RES);
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.RES).qty < stage.realEstate) {
      const toBuy = stage.aiCores - material.qty;
      c.bulkPurchase(AGRI_DIV_NAME, city, MATERIALS.RES, toBuy);
    }
    material = c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.ROB);
    if (c.getMaterial(AGRI_DIV_NAME, city, MATERIALS.ROB).qty < stage.robot) {
      const toBuy = stage.aiCores - material.qty;
      c.bulkPurchase(AGRI_DIV_NAME, city, MATERIALS.ROB, toBuy);
    }
  }
}

export function speedEmployeeStats(ns: NS, c: Corporation, stage: CorpSetupStage) {
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

export function manageInvestors(c: Corporation, minValue: number, round: number) {
  const offer = c.getInvestmentOffer();
  if (offer.round === round && offer.funds > minValue) c.acceptInvestmentOffer();
}


export function manageAevumEmployees(ns: NS, c: Corporation, size: number) {
  while (c.hireEmployee(TOB_DIV_NAME, ns.enums.CityName.Aevum)) { }

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
