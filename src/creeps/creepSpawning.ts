import {CreepRole, makeid} from "../common";

export const creepSpawning = {
  createCreep(spawn: StructureSpawn, role: CreepRole, maxEnergy: number, room: Room): CreepSpawn {
    switch (role) {
      case CreepRole.MINER:

        break;
      case CreepRole.WORKER:
        return this.createWorker(room, spawn, maxEnergy);
    }

    // shouldnt get here
    console.log("trying to create a creep with a role not yet specified");
    return {} as any;
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
        name: name
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
