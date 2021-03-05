interface CreepMemory {
  role: number;
  roomName: string;
  working: boolean;
  assignedSourceId: Id<MemSource> | undefined;
  name: string;
}

declare class MiningCreep extends Creep {
  memory: MiningCreepMemory;
}

interface MiningCreepMemory extends CreepMemory {
  isDedicated: boolean;
}

interface Memory {
  uuid: number;
  log: any;
  ownedRoomNames?: string[];
  sourceIds: Id<MemSource>[];
  spawningSpawnNames: string[];
  sourceMemories: CustomMemories
  controllerMemories: CustomMemories;
}

interface CustomMemory {}

interface CustomMemories {
  [key: string]: CustomMemory
}

interface SourceMemory extends CustomMemory{
  flagName: string;
  availableSpots: number;
  assignedCreepNames: string[];
}

interface ControllerMemory extends CustomMemory{

}

interface RoomMemory {
  spawnNames: string[];
  sourceIds: Id<MemSource>[];
  satelliteRoomNames: string[];
  creepNames: string[];
}

interface MemSource extends Source {
  memory: SourceMemory
}

interface CreepSpawn {
  spawnName: string;
  parts: BodyPartConstant[];
  name: string;
  memory: CreepMemory;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
