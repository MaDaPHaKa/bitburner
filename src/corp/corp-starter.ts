import { NS } from '@ns';
import {
  CORP_AGRI_MANTAINANCE,
  CORP_AGRI_SETUP,
  CORP_MANTAINANCE,
  CORP_TOBACCHI_MIDGAME,
  CORP_TOBACCHI_STARTUP,
} from 'const/scripts';
import { checkAndUpdateStage } from 'corp/corp-functions';
import { CorpSetupStage } from 'corp/corp-stages';

// currentyl crashes the game :(
// Starter function, based on the current corp status will spawn related script
// Stage script will (should) respawn this until mantainance one
// Corp management based on Mughur guide https://docs.google.com/document/d/1eqQ_KTnk3VkW1XLHjM2fAQbCNY05CTCE85mJFjeFDE8

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog('ALL');
  ns.enableLog('spawn');
  ns.tail();
  const c = ns.corporation;
  if (!c.hasCorporation()) {
    ns.spawn(CORP_AGRI_SETUP, 1);
    return;
  } else {
    const currentStage: CorpSetupStage = checkAndUpdateStage(ns);
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
        ns.spawn(CORP_TOBACCHI_MIDGAME, 1);
        break;
      }
      case 4: {
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
}
