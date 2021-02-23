interface CreepMemory {
  role: number;
  room: Room;
  working: boolean;
  assignedSource: MineableSource | undefined;
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
  ownedRooms?: Room[];
  sources: MineableSource[];
  spawningSpawns: StructureSpawn[];
}

interface RoomMemory {
  spawns: StructureSpawn[];
  sources: MineableSource[];
  satelliteRooms: Room[];
  creeps: Creep[];
}

interface MineableSource extends Source {
  flagName: string;
  availableSpots: number;
  assignedCreeps: Creep[];
}

interface CreepSpawn {
  spawn: StructureSpawn;
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
