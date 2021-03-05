export const hauler = {
  work(creep: Creep) {
    const roomMemory = Memory.rooms[creep.memory.roomName];
    if(creep.memory.working) {
      const room = Game.rooms[creep.memory.roomName];

      // TODO: store this in room memory
      const extensions = room.find(FIND_STRUCTURES).filter(structure => structure.structureType === STRUCTURE_EXTENSION)
        .filter(extension => extension && ((extension as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY ?? 0 > 0)));

      if (extensions.length) {
        let extension = extensions[0];
        if(creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(extension);
        }
      }
    } else {
      const spawnName = roomMemory.spawnNames[0];
      const structureSpawn = Game.spawns[spawnName];
      if (structureSpawn && structureSpawn.store[RESOURCE_ENERGY] > 0) {
        if(creep.withdraw(structureSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(structureSpawn);
        } else {
          creep.memory.working = true;
        }
        return;
      }
    }


    if (creep.store[RESOURCE_ENERGY] < 50) {
      if (creep.memory.working) {
        creep.memory.working = false;
        this.work(creep);
      }
    } else {
      return;
    }
  }
}
