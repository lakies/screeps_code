import {CreepRole, CreepState, makeid} from "../../common";

export const hauler = {
  work(creep: Creep) {
    this.runState(creep as Hauler);

  },

  fetchEnergyFromStorage(creep: Creep) {
    const roomMemory = Memory.rooms[creep.memory.roomName];
    const spawnName = roomMemory.spawnNames[0];
    const structureSpawn = Game.spawns[spawnName];
    if (structureSpawn && structureSpawn.store[RESOURCE_ENERGY] >= 50) {
      if (creep.withdraw(structureSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(structureSpawn);
      }
    } else {
      creep.memory.state = CreepState.FETCH_MINED;
      return;
    }
  },

  runState(creep: Hauler) {
    const room = Game.rooms[creep.memory.roomName];
    if (creep.memory.state === CreepState.FILL_EXTENSION) {

      // TODO: store this in room memory
      const extensions = room.find(FIND_STRUCTURES).filter(structure => structure.structureType === STRUCTURE_EXTENSION)
        .filter(extension => extension && ((extension as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY ?? 0 > 0)));


      if (extensions.length) {
        if (creep.store[RESOURCE_ENERGY] < 50) {
          this.fetchEnergyFromStorage(creep);
          return;
        }
        let extension = extensions[0];
        if (creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(extension);
        }
      } else {
        creep.memory.state = CreepState.FETCH_MINED;
      }

    } else if (creep.memory.state === CreepState.FETCH_MINED) {

      if (!creep.memory.minerName) {
        for (const creepName in Game.creeps) {
          const targetCreep = Game.creeps[creepName];
          if (targetCreep.memory.role === CreepRole.MINER) {
            const miner = targetCreep as Miner;
            if (!miner.memory.assignedHaulerName && miner.memory.needHauler) {
              miner.memory.assignedHaulerName = creep.name;
              creep.memory.minerName = miner.name;
              break;
            }
          }
        }
      }

      if (!creep.memory.minerName) {
        if (creep.store[RESOURCE_ENERGY] >= 50) {
          creep.memory.state = CreepState.DEPOSIT_MINED;
        } else {
          creep.memory.state = CreepState.FILL_EXTENSION;
        }

        return;
      }

      const miner = Game.creeps[creep.memory.minerName];
      const resources = miner.pos.lookFor<LOOK_RESOURCES>(LOOK_RESOURCES);
      if (resources.length) {
        const result = creep.pickup(resources[0]);
        if (result === ERR_NOT_IN_RANGE) {
          creep.moveTo(resources[0]);
        } else {
          creep.memory.state = CreepState.DEPOSIT_MINED;
          if (creep.memory.minerName) {
            (Game.creeps[creep.memory.minerName] as Miner).memory.assignedHaulerName = undefined;
            creep.memory.minerName = undefined;
          }
        }
      }

    } else if (creep.memory.state === CreepState.DEPOSIT_MINED) {
      if (creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.state = CreepState.FILL_EXTENSION;
        return;
      }

      let room = Game.rooms[creep.memory.roomName];
      let spawnName = room.memory.spawnNames[0];
      const structureSpawn = Game.spawns[spawnName];
      if (structureSpawn && structureSpawn.store[RESOURCE_ENERGY] < structureSpawn.store.getCapacity(RESOURCE_ENERGY)) {
        if (creep.transfer(structureSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(structureSpawn);
        }
        return;
      }

      const containers = room
        .find(FIND_STRUCTURES)
        .filter(value => value.structureType === STRUCTURE_CONTAINER)
        .filter(value => (value as StructureContainer).store.getFreeCapacity(RESOURCE_ENERGY) > 0);

      if (containers.length) {
        if (creep.transfer(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(containers[0]);
        }
        return;
      }


      creep.memory.state = CreepState.FILL_EXTENSION;
    } else {
      console.log("undefined state for hauler " + creep.name);
    }
  },


  create(room: Room, spawn: StructureSpawn, maxEnergy: number): CreepSpawn<HaulerMemory> {
    const base = [MOVE, MOVE, CARRY];
    const parts: BodyPartConstant[] = [];

    for (let i = 0; i < Math.floor(maxEnergy / 150); i++) {
      for (const baseElement of base) {
        parts.push(baseElement);
      }
    }

    let name = "hauler_" + makeid();
    return {
      spawnName: spawn.name,
      parts: parts,
      name: name,
      memory: {
        role: CreepRole.HAULER,
        roomName: room.name,
        working: false,
        assignedSourceId: undefined,
        name: name,
        state: CreepState.FILL_EXTENSION,
        minerName: undefined
      }
    }
  },

  onDestroy(creep: Creep) {
    const hauler = creep as Hauler;

    const minerName = hauler.memory.minerName;
    if (minerName) {
      (Game.creeps[minerName] as Miner).memory.assignedHaulerName = undefined;
      hauler.memory.minerName = undefined;
    }
  },

  onSpawn(creep: Creep) {
    let roomName = creep.memory.roomName;
    Game.rooms[roomName].memory.creepNames.push(creep.name);
  }
}