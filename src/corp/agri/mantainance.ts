import { CityName, Corporation, CorporationInfo, NS } from '@ns';
import {
  AGRI_DIV_NAME,
  AGRI_MATERIAL,
  CORP_NAME,
  JOBS,
  ROUND_1_MIN_AMOUNT,
  ROUND_2_MIN_AMOUNT,
  UPGRADES,
} from 'const/corp';
import { CORP_STARTUP } from 'const/scripts';
import { checkAndUpdateStage, manageInvestors, purchaseAgroMaterials, speedEmployeeStats } from 'corp/utils/functions';
import { CORP_AGRI_MAN_STAGE, CorpSetupStage } from 'corp/utils/stages';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('ALL');
  const c: Corporation = ns.corporation;
  if (!c.hasCorporation()) {
    const created = c.createCorporation(CORP_NAME, false);
    if (!created) c.createCorporation(CORP_NAME, true);
  }
  const corp: CorporationInfo = c.getCorporation();
  try {
    let currentStage: CorpSetupStage = checkAndUpdateStage(ns, c, corp);
    let setupComplete = false;
    let error = false;
    if (currentStage === undefined) {
      error = true;
      ns.print('ERROR undefined stage!');
      ns.tail();
    } else if (currentStage.mainStage.val !== 0) {
      error = true;
      ns.print('WARN stage not agri prep, this script should not have started.');
      ns.tail();
    }
    const expectedStageVal = CORP_AGRI_MAN_STAGE.mainStage.val;
    while (currentStage !== undefined && currentStage.mainStage.val === expectedStageVal) {
      ns.print('INFO: Cycle start stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
      switch (currentStage.mainStage.val) {
        case expectedStageVal: {
          manageStage(c, currentStage);
          break;
        }
        // this should not be needed.. better safe than sorry :D
        default: {
          setupComplete = true;
          break;
        }
      }
      if (setupComplete) break;
      currentStage = checkAndUpdateStage(ns, c, corp, currentStage);
      ns.print('INFO: Cycle end stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
      await ns.sleep(500);
    }
    if (!error) {
      ns.print('SUCCESS Agri startup complete, moving into mantainance.');
      ns.tail();
    }
    ns.spawn(CORP_STARTUP, 1);
  } catch (e) {
    ns.print('ERROR ', e);
    ns.tail();
  }
}

function manageStage(c: Corporation, currentStage: CorpSetupStage) {
  switch (currentStage.subStage.val) {
    case 0: {
      manageInvestors(c, ROUND_1_MIN_AMOUNT, 1);
      break;
    }
    case 1: {
      for (const city of Object.values(CityName)) {
        const office = c.getOffice(AGRI_DIV_NAME, city);
        if (office.size < 9) {
          const toAdd = 9 - office.size;
          c.upgradeOfficeSize(AGRI_DIV_NAME, city, toAdd);
          while (c.hireEmployee(AGRI_DIV_NAME, city)) {}
          c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.OPS, 1);
          c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.ENG, 1);
          c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.BUS, 1);
          c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.MAN, 2);
          c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.RND, 1);
        }
      }
      break;
    }
    case 2: {
      for (const upgr of [UPGRADES.SST, UPGRADES.SFA]) {
        while (c.getUpgradeLevel(upgr) < 10) {
          c.levelUpgrade(upgr);
        }
      }
      break;
    }
    case 3: {
      for (const city of Object.values(CityName)) {
        while (c.getWarehouse(AGRI_DIV_NAME, city).level < 9) {
          c.upgradeWarehouse(AGRI_DIV_NAME, city);
        }
      }
      break;
    }
    case 4: {
      purchaseAgroMaterials(c, AGRI_MATERIAL.stage2);
      break;
    }
    case 5: {
      speedEmployeeStats(c, currentStage);
      break;
    }
    case 6: {
      for (const city of Object.values(CityName)) {
        const office = c.getOffice(AGRI_DIV_NAME, city);
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.RND, 0);
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.OPS, 3);
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.ENG, 2);
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.BUS, 2);
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.MAN, 2);
      }
      manageInvestors(c, ROUND_2_MIN_AMOUNT, 1);
      break;
    }
    case 7: {
      for (const city of Object.values(CityName)) {
        while (c.getWarehouse(AGRI_DIV_NAME, city).level < 18) {
          c.upgradeWarehouse(AGRI_DIV_NAME, city);
        }
      }
      break;
    }
    case 8: {
      purchaseAgroMaterials(c, AGRI_MATERIAL.stage3);
      break;
    }
  }
}
