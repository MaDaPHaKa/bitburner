import { NS } from '@ns';
import { ServerManager } from 'utils/server-manager';

export class HomeServerManager extends ServerManager {
  constructor(ns: NS) {
    super(ns, ['home']);
  }
}
