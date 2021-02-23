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

    return {
      spawn: spawn,
      parts: parts,
      name: "worker_" + makeid(),
      memory: {
        role: CreepRole.WORKER,
        room: room,
        working: true,
        assignedSource: this.findEmptySource()
      }
    }
  },

  findEmptySource(): MineableSource {
    for (const source of Memory.sources) {
      if (source.availableSpots > source.assignedCreeps.length) {

        return source;
      }
    }

    throw "Unable to assign source for new creep"
  }
}
