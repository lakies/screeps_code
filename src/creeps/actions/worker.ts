export const worker = {
  work(creep: Creep) {

    if(!creep.memory.working) {
      let id = creep.memory.assignedSourceId;
      if (!id) {
        return;
      }

      let target = Game.getObjectById<Source>(id);
      if (target) {
        if (creep.harvest(target) === ERR_NOT_IN_RANGE){
          creep.moveTo(target);
        }
      }

      if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {
        creep.memory.working = true;
        creep.say("working");
      } else {
        return;
      }
    }

    if (creep.store[RESOURCE_ENERGY] === 0) {
      creep.memory.working = false;
      creep.say("mining");
      return;
    }


    let room = Memory.rooms[creep.memory.roomName];
    let spawnName = room.spawnNames[0];
    const structureSpawn = Game.spawns[spawnName];
    if (structureSpawn && structureSpawn.store[RESOURCE_ENERGY] < structureSpawn.store.getCapacity(RESOURCE_ENERGY)) {
      if(creep.transfer(structureSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(structureSpawn);
      }
      return;
    }

    // TODO: Optimize building
    const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    if(target) {
      if(creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      }
      return;
    }

    // let controller = creep.memory.room.controller;
    // if (controller) {
    //   if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE){
    //     creep.moveTo(controller);
    //   }
    //   return;
    // }
  },
}
