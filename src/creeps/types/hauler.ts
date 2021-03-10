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
    if (creep.memory.state === CreepState.FILL) {

      // TODO: store this in room memory
      const extensions = room.find(FIND_STRUCTURES).filter(structure => structure.structureType === STRUCTURE_EXTENSION)
        .filter(extension => extension && ((extension as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY ?? 0 > 0)));

      const towers = room.find(FIND_STRUCTURES).filter(structure => structure.structureType === STRUCTURE_TOWER)
        .filter(tower => tower && ((tower as StructureTower).store.getFreeCapacity(RESOURCE_ENERGY ?? 0 > 0)));


      if (extensions.length + towers.length) {
        if (creep.store[RESOURCE_ENERGY] < 50) {
          this.fetchEnergyFromStorage(creep);
          return;
        }

        let target;
        if (extensions.length) {
          target = extensions[0];
        } else {
          target = towers[0];
        }
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(target);
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
          creep.memory.state = CreepState.FILL;
        }

        return;
      }

      const miner = Game.creeps[creep.memory.minerName];
      if (!miner) { // prbably spawning
        return;
      }
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
        creep.memory.state = CreepState.FILL;
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


      const storages = room.find(FIND_STRUCTURES).filter(structure => structure.structureType === STRUCTURE_STORAGE)
        .filter(tower => tower && ((tower as StructureStorage).store.getFreeCapacity(RESOURCE_ENERGY ?? 0 > 0)));
      if (storages.length) {
        if (creep.transfer(storages[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(storages[0]);
        }
        return;
      }


      creep.memory.state = CreepState.FILL;
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
        state: CreepState.FILL,
        minerName: undefined,
        path: undefined
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
