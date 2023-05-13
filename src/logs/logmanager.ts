import { NS } from '@ns';
import { HWGW_LOG_FILE } from 'const/files';
import { EMPTY_PORT_DATA, LOG_MANAGER_PORT } from 'const/ports';
import { FileHandler } from 'files/filehandler';
import { Log } from 'logs/logger';

/** @param {NS} ns */
export async function main(ns: NS) {
  const port = ns.getPortHandle(LOG_MANAGER_PORT);
  port.clear();
  ns.disableLog('ALL');
  ns.clearLog();
  ns.tail();
  ns.moveTail(200, 200); // Move it out of the way so it doesn't cover up the controller.
  const handler: FileHandler = new FileHandler(ns, HWGW_LOG_FILE);
  handler.newFile();
  while (true) {
    await port.nextWrite();
    do {
      const value = port.read() as string;
      if (value !== EMPTY_PORT_DATA) {
        const log: Log = JSON.parse(value) as Log;
        // handler.writeText(new Date(log.time).toISOString(), 'a');
        // handler.writeText(' ', 'a');
        // handler.writeText(log.logType, 'a');
        // handler.writeText(' ', 'a');
        // handler.writeText(log.log, 'a');
        // handler.writeText('\n\r', 'a');
        ns.print(log.logType + ' ' + log.log);
      }
    } while (!port.empty());
  }
}
