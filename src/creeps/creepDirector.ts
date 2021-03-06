import {CreepRole} from "../common";
import {worker} from "./actions/worker";
import {hauler} from "./actions/hauler";

export const creepDirector = {
  run: function (): void {
    for (const creepHash of Object.keys(Game.creeps)) {
      let creep = Game.creeps[creepHash];
      this.handleCreep(creep);
    }
  },

  handleCreep(creep: Creep): void {

    if ((creep.ticksToLive ?? 0) < 500) {
      this.destroyCreep(creep);
      return;
    }

    // const roomName = creep.memory.roomName;
    // Game.rooms[roomName].createConstructionSite(creep.pos, STRUCTURE_ROAD);

    switch (creep.memory.role) {
      case CreepRole.MINER:
        // this.mine(creep as MiningCreep);
        break;


      case CreepRole.WORKER:
        worker.work(creep);
        break;

      case CreepRole.DISTRIBUTOR:
        hauler.work(creep);
        break;
    }
  },

  // mine: function (creep: MiningCreep): void {
  //   const targetId = creep.memory.assignedSourceId;
  //   if (!targetId) {
  //     return;
  //   }
  //   const target = Game.getObjectById<MemSource>(targetId);
  //   if (!target) {
  //     throw "";
  //   }
  //
  //   if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
  //     creep.moveTo(target);
  //   }
  //
  //   if (creep.store.getFreeCapacity() == 0) {
  //     creep.memory.working = false;
  //   }
  // },

  destroyCreep(creep: Creep) {
    creep.suicide();
  }
};
