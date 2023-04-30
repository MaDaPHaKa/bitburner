// SCAN SCRIPTS
export const SCAN_SCRIPT_NAME = '/scan-and-nuke/scan-and-update-file.js';
export const GET_INFO_NAME = '/scan-and-nuke/get-stats.js';
// MANAGER SCRIPTS
export const MANAGE_ALL_NAME = '/managers/manage-all.js';
export const MANAGERV2_NAME = '/managers/managerV2.js';
export const BEGINNER_MANAGER_NAME = '/managers/beginner-manager.js';
export const BITNODE_MANAGER_NAME = '/managers/bitnode-start-manager.js';
export const HWGW_MANAGER_NAME = '/managers/hwgw-manager.js';

// COPY TO SERVER SCRIPTS
export const MYSELF = '/const/files.js';
export const BEGINNER_HACK_SCRIPT_NAME = 'beginner-hack.js';
export const SERVER_GROW_SCRIPT_NAME = '/mono/server-grow.js';
export const SERVER_HACK_SCRIPT_NAME = '/mono/server-hack.js';
export const SERVER_WEAKEN_SCRIPT_NAME = '/mono/server-weaken.js';
export const SERVER_WEAKEN_V2_SCRIPT_NAME = '/mono/server-weakenV2.js';
export const XP_FARM_SCRIPT_NAME = '/mono/xp-farm-weaken.js';
export const PREP_SERVER_WEAKEN_SCRIPT = '/prep/weak.js';
export const PREP_SERVER_GROW_SCRIPT = '/prep/grow.js';
export const PREP_SERVER_HACK_SCRIPT = '/prep/hack.js';
export const HWGW_SERVER_WEAKEN_SCRIPT = '/hwgw/weak.js';
export const HWGW_SERVER_GROW_SCRIPT = '/hwgw/grow.js';
export const HWGW_SERVER_HACK_SCRIPT = '/hwgw/hack.js';

// OTHER SCRIPTS
export const HWGW_PREP_SCRIPT_NAME = '/hwgw/hwgw-prepper.js';

export const FILES_TO_COPY = [
  PREP_SERVER_WEAKEN_SCRIPT,
  PREP_SERVER_GROW_SCRIPT,
  PREP_SERVER_HACK_SCRIPT,
  HWGW_SERVER_HACK_SCRIPT,
  HWGW_SERVER_GROW_SCRIPT,
  HWGW_SERVER_WEAKEN_SCRIPT,
  BEGINNER_HACK_SCRIPT_NAME,
  XP_FARM_SCRIPT_NAME,
  MYSELF,
];

// NUMBER CONSTANTS
export const WG_COST = 1.75;
export const H_COST = 1.7;
// DEFAULT MONEY % TO HACK
export const HWGW_MONEY_PERCENTAGE = 0.8;
// MIN MONEY % TO HACK, IF NOT POSSIBLE SKIP TARGET\SERVER
export const HWGW_MONEY_MIN_PERCENTAGE = 0.2;
// % TO HACK DIFF TO LOWER
export const HWGW_MONEY_ITERATION_PERCENTAGE = 0.05;

// PORTS CONSTANTS
export const HWGW_PORT_1 = 1;
export const HWGW_PORT_2 = 2;
export const HWGW_PORT_3 = 3;
export const HWGW_PORT_4 = 4;
export const HWGW_PREP_PORT_1 = 250;
export const HWGW_PREP_PORT_2 = 251;
export const HWGW_PREP_PORT_3 = 252;
export const HWGW_PREP_PORT_4 = 253;
export const EMPTY_PORT_DATA = 'NULL PORT DATA';
export const HWGW_PORTS = [HWGW_PORT_1, HWGW_PORT_2, HWGW_PORT_3, HWGW_PORT_4];
export const HWGW_PREP_PORTS = [HWGW_PREP_PORT_1, HWGW_PREP_PORT_2, HWGW_PREP_PORT_3, HWGW_PREP_PORT_4];

// FILE CONSTANTS
export const ALL_SERVERS_FILENAME = '/data/all_servers.txt';
export const SERVERS_FILENAME = '/data/servers.txt';
export const SERVERS_DETAIL_FILENAME = '/data/servers_detail.txt';

// SERVER CONSTANTS
export const SERVER_NAME_PREFIX = 'srv-';
export const XP_FARMER_SERVER_PREFIX = 'farmer-srv-';
export const HOME_FREE_RAM_TO_KEEP = 40;
export const MIN_HOME_RAM_TO_RUN_HWGW = 1024;
// MAX_RAM_STANDARD 1048576
// MAX_RAM_CURRENT_BN 524288
export const MAX_RAM = 524288;
export const SERVER_GB = 131072;
export const SERVER_GB_WANTED = 131072;
export const MAX_SERVER_NUM = 20;
export const MAX_FARMER_SERVER_NUM = 5;
export const FARM_SERVER_GB = 262144;
// 262144 | 131072 | 65536 | 32768 | 16384 | 8192

// OTHER
export const HOME_SERVER_CARROZZATO = false;
