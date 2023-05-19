import { Corporation, CorporationInfo, NS } from '@ns';
import { TOB_DIV_NAME, TOB_PROD2_NAME, TOB_PROD3_NAME } from 'const/corp';
import { CORP_STARTUP } from 'const/scripts';
import { manageProductSell } from 'corp/tobacchi/product-functions';
import { checkAndUpdateStage, manageAevumEmployees, } from 'corp/utils/functions';
import { CORP_TOB_MANTAINANCE_STAGE, CorpSetupStage } from 'corp/utils/stages';

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('ALL');
  const c: Corporation = ns.corporation;
  if (!c.hasCorporation()) {
    ns.print('ERROR no corporation, this script should not have started!');
    ns.spawn(CORP_STARTUP, 1);
  } else {
    await runStage(c, ns);
  }
}

async function runStage(c: Corporation, ns: NS) {
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
      ns.print('WARN stage not tobacchi mantainance, this script should not have started.');
      ns.tail();
    }
    const expectedStageVal = CORP_TOB_MANTAINANCE_STAGE.mainStage.val;
    while (currentStage !== undefined && currentStage.mainStage.val === expectedStageVal) {
      ns.clearLog();
      ns.print('INFO: Cycle start stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
      switch (currentStage.mainStage.val) {
        case expectedStageVal: {
          await manageStage(ns, c);
          break;
        }
        // this should not be needed.. better safe than sorry :D
        default: {
          setupComplete = true;
          break;
        }
      }
      if (setupComplete)
        break;
      currentStage = checkAndUpdateStage(ns, c, corp, currentStage);
      ns.print('INFO: Cycle end stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
      await ns.sleep(500);
    }
    if (!error) {
      ns.print('SUCCESS Tobacchi midgame complete, moving into mantainance.');
      ns.tail();
    }
    ns.spawn(CORP_STARTUP, 1);
  } catch (e) {
    ns.print('ERROR ', e);
    ns.tail();
  }
}

async function manageStage(ns: NS, c: Corporation) {
  hireIntoAevum(ns, c);
  const prod2 = c.getProduct(TOB_DIV_NAME, TOB_PROD2_NAME);
  if (prod2.developmentProgress == 100) {
    try {
      const prod3 = c.getProduct(TOB_DIV_NAME, TOB_PROD3_NAME);
      if (prod3.developmentProgress == 100) {
        await manageProductSell(ns, c, prod3);
      }
    } catch (e) {
      if (c.getCorporation().funds > 1e9 * 2)
        c.makeProduct(TOB_DIV_NAME, ns.enums.CityName.Aevum, TOB_PROD3_NAME, 1e9, 1e9);
    }
    await manageProductSell(ns, c, prod2);
  }
}

function hireIntoAevum(ns: NS, c: Corporation) {
  const toAdd = 60 - c.getOffice(TOB_DIV_NAME, ns.enums.CityName.Aevum).employees;
  if (toAdd > 0) {
    c.upgradeOfficeSize(TOB_DIV_NAME, ns.enums.CityName.Aevum, toAdd);
    manageAevumEmployees(ns, c, 60);
  }
}
