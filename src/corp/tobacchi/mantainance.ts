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
      while (c.getCorporation().state != 'EXPORT') {
        //when you make your main script, put things you want to be done
        //potentially multiple times every cycle, like buying upgrades, here.
        await ns.sleep(0);
      }

      while (c.getCorporation().state == 'EXPORT') {
        //same as above
        await ns.sleep(0);
      }
      //and to this part put things you want done exactly once per cycle
      switch (currentStage.mainStage.val) {
        case expectedStageVal: {
          await manageStage(ns, c);
          break;
        }
        // this should not be possible..
        default: {
          setupComplete = true;
          break;
        }
      }
      if (setupComplete) {
        ns.print('ERROR Tobacchi mantaiance complete, should not be possible.');
        ns.tail();
        break;
      }
      currentStage = checkAndUpdateStage(ns, c, corp, currentStage);
      ns.print('INFO: Cycle end stage: ', `${currentStage.mainStage.name}-${currentStage.subStage.name}`);
    }
    if (!error) {
      ns.print('ERROR Tobacchi mantaiance complete, should not be possible.');
      ns.tail();
    }
    ns.spawn(CORP_STARTUP, 1);
  } catch (e) {
    ns.print('ERROR ', e);
    ns.tail();
    throw e;
  }
}

async function manageStage(ns: NS, c: Corporation) {
  ns.print('temp, ', c);
}

