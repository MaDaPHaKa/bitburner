import { CityName, Corporation, CorporationInfo, NS } from '@ns';
import { AGRI_DIV_NAME, AgriMaterialStage, CORP_SETUP_UPGRADES, MATERIALS, TOB_DIV_NAME } from 'const/corp';
import { checkAgriSetupStage } from 'corp/agri/setup-checks';
import { CorpSetupStage } from 'corp/utils/stages';

export function checkAndUpdateStage(ns: NS, c: Corporation, corp: CorporationInfo): CorpSetupStage {
  let currentStage: CorpSetupStage | undefined;
  if (!corp.divisions.includes(TOB_DIV_NAME)) {
    currentStage = checkAgriSetupStage(ns, c, corp);
  } else {
  }
  // No stage found, this shouldn't ever happen, throw error
  if (currentStage === undefined) {
    throw new Error("No stage found, this shouldn't ever happen");
  }
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

export function checkAgroWarehouse(c: Corporation, level: number): boolean {
  for (const city of Object.values(CityName)) {
    if (c.getWarehouse(AGRI_DIV_NAME, city).level < level) {
      return false;
    }
  }
  return true;
}

export function checkAgroMaterials(c: Corporation, stage: AgriMaterialStage): boolean {
  for (const city of Object.values(CityName)) {
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

export function purchaseAgroMaterials(c: Corporation, stage: AgriMaterialStage) {
  for (const city of Object.values(CityName)) {
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

export function speedEmployeeStats(c: Corporation, stage: CorpSetupStage) {
  if (stage.lastEmpStatsCheck === -1) {
    stage.lastEmpStatsCheck = Date.now();
  } else if (Date.now() - stage.lastEmpStatsCheck > 60 * 5 * 1000) {
    for (const city of Object.values(CityName)) {
      c.buyCoffee(AGRI_DIV_NAME, city);
      c.throwParty(AGRI_DIV_NAME, city, 500000);
    }
    stage.lastEmpStatsCheck = -1;
  }
}

export function checkAgroEmployees(c: Corporation, moveToRnD = false): boolean {
  for (const city of Object.values(CityName)) {
    const office = c.getOffice(AGRI_DIV_NAME, city);
    if (office.size < 9) return false;
    else if (office.employeeJobs['Research & Development'] > 0 && moveToRnD) return false;
  }
  return true;
}

export function checkAgroEmployeeStats(ns: NS, c: Corporation): boolean {
  let avgMor = 0;
  let avgHap = 0;
  let avgEne = 0;
  for (const city of Object.values(CityName)) {
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
  if (avgMor >= 97 && avgHap / 6 >= 97 && avgEne >= 97) {
    return true;
  }
  return false;
}
