interface CreepMemory {
  role: number;
  roomName: string;
  working: boolean;
  assignedSourceId: Id<MemSource> | undefined;
  name: string;
  state: number;
  path: PathStep[] | undefined;
}

declare class Miner extends Creep {
  memory: MiningCreepMemory;
}

interface MiningCreepMemory extends CreepMemory {
  assignedHaulerName: string | undefined;
  needHauler: boolean;
}


declare class Worker extends Creep {
  memory: WorkerMemory;
}

interface WorkerMemory extends CreepMemory {
  tookEnergyFromSpawn: boolean;
}

declare class Hauler extends Creep {
  memory: HaulerMemory;
}

interface HaulerMemory extends CreepMemory {
  minerName: string | undefined;

}

declare class Attacker extends Creep {
  memory: AttackerMemory;
}

interface AttackerMemory extends CreepMemory {
  targetFlagName: string | undefined;
  movePath: PathStep[] | undefined;
  lastRoomName: string | undefined;
}

interface Memory {
  uuid: number;
  log: any;
  ownedRoomNames?: string[];
  sourceIds: Id<MemSource>[];
  spawningSpawnNames: string[];
  sourceMemories: CustomMemories;
  controllerMemories: CustomMemories;
  misc: any,
  stats: any
}

interface CustomMemory {}

interface CustomMemories {
  [key: string]: CustomMemory
}

interface SourceMemory extends CustomMemory{
  flagName: string;
  availableSpots: number;
  assignedCreepNames: string[];
  roadBuilt: boolean;
  minerName: string | undefined;
  needMiner: boolean;
  timeWithoutMiners: number | undefined;
}

interface ControllerMemory extends CustomMemory{
  roadBuilt: boolean;
}

interface RoomMemory {
  spawnNames: string[];
  sourceIds: Id<MemSource>[];
  satelliteRoomNames: string[];
  creepNames: string[];
  towerId: Id<StructureTower> | undefined;
}

interface FlagMemory {
  attackerName: string | undefined;
}

interface MemSource extends Source {
  memory: SourceMemory
}

interface MemController extends StructureController {
  memory: ControllerMemory
}

interface CreepSpawn<T extends CreepMemory> {
  spawnName: string;
  parts: BodyPartConstant[];
  name: string;
  memory: T;
}

interface Pos {
  x: number,
  y: number
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
