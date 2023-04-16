import { NS } from '@ns';
import { ALL_SERVERS_FILENAME, SERVERS_DETAIL_FILENAME, SERVERS_FILENAME } from 'const/files';
import { FileHandler } from 'files/filehandler';
import { ServerInfo } from 'utils/server-info';

export async function loadTargetNames(ns: NS): Promise<string[]> {
  return (await new FileHandler(ns, SERVERS_FILENAME).read()) as string[];
}

export async function loadTargetInfo(ns: NS): Promise<ServerInfo[]> {
  return await new FileHandler(ns, SERVERS_DETAIL_FILENAME).read();
}

export async function loadAllTargets(ns: NS): Promise<string[]> {
  return await new FileHandler(ns, ALL_SERVERS_FILENAME).read();
}
