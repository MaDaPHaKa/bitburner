import { Corporation, CorporationInfo, NS } from '@ns';
import { CORP_AGRI_MANTAINANCE, CORP_AGRI_SETUP, CORP_MANTAINANCE, CORP_TOBACCHI_STARTUP } from 'const/scripts';
import { checkAndUpdateStage } from 'corp/utils/functions';
import { CorpSetupStage } from 'corp/utils/stages';

/** @param {NS} ns */
export async function main(ns: NS) {
  const c: Corporation = ns.corporation;
  if (!c.hasCorporation()) {
    ns.spawn(CORP_AGRI_SETUP, 1);
  }
  const corp: CorporationInfo = c.getCorporation();
  let currentStage: CorpSetupStage = checkAndUpdateStage(ns, c, corp);
  switch (currentStage.mainStage.val) {
    case 0: {
      ns.spawn(CORP_AGRI_SETUP, 1);
      break;
    }
    case 1: {
      ns.spawn(CORP_AGRI_MANTAINANCE, 1);
      break;
    }
    case 2: {
      ns.spawn(CORP_TOBACCHI_STARTUP, 1);
      break;
    }
    case 3: {
      ns.spawn(CORP_MANTAINANCE, 1);
      break;
    }
    default: {
      ns.print('ERROR No stage found!');
      ns.tail();
      break;
    }
  }
}
