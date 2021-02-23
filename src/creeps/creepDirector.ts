import {CreepRole} from "../common";

export const creepDirector = {
  run: function (): void {
    for (const creepHash of Object.keys(Game.creeps)) {
      let creep = Game.creeps[creepHash];
      this.handleCreep(creep);
    }
  },

  handleCreep(creep: Creep): void {

    if ((creep.ticksToLive ?? 0) < 3) {
      this.destroyCreep(creep);
      return;
    }

    switch (creep.memory.role) {
      case CreepRole.MINER: {
        this.mine(creep as MiningCreep);
        break;
      }

      case CreepRole.WORKER:
        this.work(creep);
        break;
    }
  },

  mine: function (creep: MiningCreep): void {
    let target = creep.memory.assignedSource;
    if (!target) {
      return;
    }

    if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target);
    }

    if (creep.store.getFreeCapacity() == 0) {
      creep.memory.working = false;
    }
  },

  work(creep: Creep) {
    if(!creep.memory.working) {
      let id = creep.memory.assignedSource?.id;
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
      // could call
      return;
    }


    let room = Memory.rooms[creep.memory.room.name];
    let spawnId = room.spawns[0].id;
    const structureSpawn = Game.getObjectById<StructureSpawn>(spawnId);
    if (structureSpawn && structureSpawn.store[RESOURCE_ENERGY] < structureSpawn.store.getCapacity(RESOURCE_ENERGY)) {
      console.log(creep.transfer(structureSpawn, RESOURCE_ENERGY));

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
  },

  destroyCreep(creep: Creep) {

  }
};
