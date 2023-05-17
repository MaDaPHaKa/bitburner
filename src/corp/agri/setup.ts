import { CityName, Corporation, CorporationInfo, NS } from '@ns';
import { AGRI_DIV_NAME, AGRI_MATERIAL, CORP_NAME, CORP_SETUP_UPGRADES, JOBS, UNLOCKS, UPGRADES } from 'const/corp';
import { CORP_AGRI_SETUP, CORP_STARTUP } from 'const/scripts';
import { checkAndUpdateStage, purchaseAgroMaterials, speedEmployeeStats } from 'corp/utils/functions';
import { CORP_AGRI_SETUP_STAGE, CorpSetupStage } from 'corp/utils/stages';

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
    const expectedStageVal = CORP_AGRI_SETUP_STAGE.mainStage.val;
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
      c.expandIndustry('Agriculture', AGRI_DIV_NAME);
      break;
    }
    case 1: {
      c.unlockUpgrade(UNLOCKS.SSU);
      break;
    }
    case 2: {
      for (const city of Object.values(CityName)) {
        if (!c.getDivision(AGRI_DIV_NAME).cities.includes(city)) {
          c.expandCity(AGRI_DIV_NAME, city);
          c.purchaseWarehouse(AGRI_DIV_NAME, city);
        }
        c.setSmartSupply(AGRI_DIV_NAME, city, true);
        while (c.hireEmployee(AGRI_DIV_NAME, city)) {}
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.OPS, 1);
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.ENG, 1);
        c.setAutoJobAssignment(AGRI_DIV_NAME, city, JOBS.BUS, 1);
        c.sellMaterial(AGRI_DIV_NAME, city, 'Plants', 'MAX', 'MP');
        c.sellMaterial(AGRI_DIV_NAME, city, 'Food', 'MAX', 'MP');
      }
      break;
    }
    case 3: {
      c.hireAdVert(AGRI_DIV_NAME);
      break;
    }
    case 4: {
      for (const city of Object.values(CityName)) {
        while (c.getWarehouse(AGRI_DIV_NAME, city).level < 2) {
          c.upgradeWarehouse(AGRI_DIV_NAME, city);
        }
      }
      break;
    }
    case 5: {
      for (const upgr of CORP_SETUP_UPGRADES) {
        while (c.getUpgradeLevel(upgr) < 2) {
          c.levelUpgrade(upgr);
        }
      }
      break;
    }
    case 6: {
      purchaseAgroMaterials(c, AGRI_MATERIAL.stage1);
      break;
    }
    case 7: {
      speedEmployeeStats(c, currentStage);
      break;
    }
  }
}