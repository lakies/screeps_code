import {CreepRole} from "../common";
import {worker} from "./types/worker";
import {hauler} from "./types/hauler";
import {miner} from "./types/miner";
import {attacker} from "./types/attacker";

export const creepDirector = {
  run: function (): void {
    for (const creepHash of Object.keys(Game.creeps)) {
      let creep = Game.creeps[creepHash];
      this.handleCreep(creep);
    }
  },

  handleCreep(creep: Creep): void {

    if (creep.ticksToLive == 2 || (creep.memory as any).kill) {
      this.destroyCreep(creep);
      return;
    }

    // const roomName = creep.memory.roomName;
    // Game.rooms[roomName].createConstructionSite(creep.pos, STRUCTURE_ROAD);

    if (creep.memory.path) {
      if (creep.memory.path.length === 0) {
        creep.memory.path = undefined;

      } else {
        creep.moveByPath(creep.memory.path);
        const pathStep = creep.memory.path[creep.memory.path.length - 1];
        if (creep.pos.x === pathStep.x && creep.pos.y === pathStep.y) {
          creep.memory.path = undefined;
        } else {
          return;
        }
      }
    }

    switch (creep.memory.role) {
      case CreepRole.MINER:
        miner.work(creep);
        break;
      case CreepRole.WORKER:
        worker.work(creep);
        break;

      case CreepRole.HAULER:
        hauler.work(creep);
        break;

      case CreepRole.ATTACKER:
        attacker.work(creep);
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

    switch (creep.memory.role) {
      case CreepRole.MINER:
        miner.onDestroy(creep);
        break;
      case CreepRole.WORKER:
        worker.onDestroy(creep);
        break;
      case CreepRole.HAULER:
        hauler.onDestroy(creep);
        break;

      case CreepRole.ATTACKER:
        attacker.onDestroy(creep);
        break;
    }

    creep.suicide();
  }
};
