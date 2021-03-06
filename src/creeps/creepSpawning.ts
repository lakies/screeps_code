import {CreepRole, CreepState, makeid} from "../common";

export const creepSpawning = {
  createCreep(spawn: StructureSpawn, role: CreepRole, maxEnergy: number, room: Room): CreepSpawn {
    switch (role) {
      case CreepRole.MINER:

        break;
      case CreepRole.WORKER:
        return this.createWorker(room, spawn, maxEnergy);

      case CreepRole.DISTRIBUTOR:
        return this.createHauler(room, spawn, maxEnergy);
    }

    // shouldnt get here
    console.log("trying to create a creep with a role not yet specified");
    return {} as any;
  },

  createHauler(room: Room, spawn: StructureSpawn, maxEnergy: number): CreepSpawn {
    const base = [MOVE, MOVE, CARRY];
    const parts: BodyPartConstant[] = [];

    for (let i = 0; i < Math.floor(maxEnergy / 200); i++) {
      for (const baseElement of base) {
        parts.push(baseElement);
      }
    }

    let name = "distributor_" + makeid();
    return {
      spawnName: spawn.name,
      parts: parts,
      name: name,
      memory: {
        role: CreepRole.DISTRIBUTOR,
        roomName: room.name,
        working: false,
        assignedSourceId: undefined,
        name: name,
        isUpgrading: false,
        state: CreepState.BUILDING
      }
    }
  },

  createWorker(room: Room, spawn: StructureSpawn, maxEnergy: number): CreepSpawn {
    const base = [MOVE, WORK, CARRY];
    const parts: BodyPartConstant[] = [];

    for (let i = 0; i < Math.floor(maxEnergy / 200); i++) {
      for (const baseElement of base) {
        parts.push(baseElement);
      }
    }

    let name = "worker_" + makeid();
    return {
      spawnName: spawn.name,
      parts: parts,
      name: name,
      memory: {
        role: CreepRole.WORKER,
        roomName: room.name,
        working: true,
        assignedSourceId: this.findEmptySource().id,
        name: name,
        isUpgrading: false,
        state: CreepState.BUILDING
      }
    }
  },

  findEmptySource(): MemSource {
    for (const sourceId of Memory.sourceIds) {
      const source = Game.getObjectById<MemSource>(sourceId);
      if (!source) {
        throw "";
      }
      if (source.memory.availableSpots > source.memory.assignedCreepNames.length) {

        return source;
      }
    }

    throw "Unable to assign source for new creep"
  }
}
