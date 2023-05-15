import { CityName, Corporation, CorporationInfo, NS } from '@ns';
import { CORP_NAME, TOB_DIV_NAME, TOB_PROD2_NAME, TOB_PROD3_NAME } from 'const/corp';
import { CORP_STARTUP } from 'const/scripts';
import { checkAndUpdateStage, manageAevumEmployees, manageProductSell } from 'corp/utils/functions';
import { CORP_TOB_SETUP_STAGE, CorpSetupStage } from 'corp/utils/stages';

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
    } else if (currentStage.mainStage.val !== 2) {
      error = true;
      ns.print('WARN stage not tobacchi prep, this script should not have started.');
      ns.tail();
    }
    const expectedStageVal = CORP_TOB_SETUP_STAGE.mainStage.val;
    while (currentStage !== undefined && currentStage.mainStage.val === expectedStageVal) {
      ns.print('INFO: Cycle start stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
      switch (currentStage.mainStage.val) {
        case expectedStageVal: {
          await manageStage(ns, c, currentStage);
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
      ns.print('SUCCESS Tobacchi startup complete, moving into midgame.');
      ns.tail();
    }
    ns.spawn(CORP_STARTUP, 1);
  } catch (e) {
    ns.print('ERROR ', e);
    ns.tail();
  }
}

async function manageStage(ns: NS, c: Corporation, currentStage: CorpSetupStage) {
  hireIntoAevum(c);
  const prod2 = c.getProduct(TOB_DIV_NAME, TOB_PROD2_NAME);
  if (prod2.developmentProgress == 100) {
    try {
      const prod3 = c.getProduct(TOB_DIV_NAME, TOB_PROD3_NAME);
      if (prod3.developmentProgress == 100) {
        await manageProductSell(ns, c, prod3);
      }
    } catch (e) {
      c.makeProduct(TOB_DIV_NAME, CityName.Aevum, TOB_PROD3_NAME, 1e9, 1e9);
    }
    await manageProductSell(ns, c, prod2);
  }
}

function hireIntoAevum(c: Corporation) {
  const toAdd = 60 - c.getOffice(TOB_DIV_NAME, CityName.Aevum).employees;
  if (toAdd > 0) {
    c.upgradeOfficeSize(TOB_DIV_NAME, CityName.Aevum, toAdd);
    manageAevumEmployees(c, 60);
  }
}
