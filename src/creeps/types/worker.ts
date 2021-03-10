import {addPos, CreepRole, CreepState, linearRoomDist, makeid, roomPosToPos, subtractPos} from "../../common";

export const worker = {
  work(creep: Creep) {

    switch (creep.memory.state) {
      case CreepState.GET_ENERGY: {

        if (creep.memory.assignedSourceId) {
          creep.say("mining");
          creep.memory.state = CreepState.MINING;
          this.work(creep);
          return;
        }

        const roomName = creep.memory.roomName;
        const room = Game.rooms[roomName];
        const containers = room.find(FIND_STRUCTURES).filter(value => value.structureType === STRUCTURE_CONTAINER)
          .filter(value => (value as StructureContainer).store[RESOURCE_ENERGY] > 0);

        const worker = creep as Worker;
        if (containers.length) {
          if (creep.withdraw(containers[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(containers[0]);
          } else {
            worker.memory.tookEnergyFromSpawn = false;
          }
        } else {
          let room = Memory.rooms[creep.memory.roomName];
          let spawnName = room.spawnNames[0];
          const structureSpawn = Game.spawns[spawnName];
          if (structureSpawn && structureSpawn.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            if (creep.withdraw(structureSpawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
              creep.moveTo(structureSpawn);
            } else {
              worker.memory.tookEnergyFromSpawn = true;
            }
          }
        }

        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {

          let room = Memory.rooms[creep.memory.roomName];
          let spawnName = room.spawnNames[0];
          const structureSpawn = Game.spawns[spawnName];
          if (!worker.memory.tookEnergyFromSpawn && structureSpawn && structureSpawn.store[RESOURCE_ENERGY] < structureSpawn.store.getCapacity(RESOURCE_ENERGY)) {
            creep.memory.state = CreepState.DEPOSIT_MINED;
          } else if (Math.random() < 0.1) {
            creep.memory.state = CreepState.UPGRADING;
          } else {
            creep.memory.state = CreepState.BUILDING;
          }
        }

        break;
      }

      case CreepState.MINING: {
        let id = creep.memory.assignedSourceId;
        if (!id) {
          console.log(`Illegal mining state for worker ${creep.name}: no source assigned `);
          break;
        }

        let target = Game.getObjectById<Source>(id);
        if (target) {
          if (creep.harvest(target) === ERR_NOT_IN_RANGE){
            creep.moveTo(target);
          }
        }

        if (creep.store[RESOURCE_ENERGY] === creep.store.getCapacity()) {

          let room = Memory.rooms[creep.memory.roomName];
          let spawnName = room.spawnNames[0];
          const structureSpawn = Game.spawns[spawnName];
          if (structureSpawn && structureSpawn.store[RESOURCE_ENERGY] < structureSpawn.store.getCapacity(RESOURCE_ENERGY)) {
            creep.memory.state = CreepState.DEPOSIT_MINED;
          } else if (Math.random() < 0.1) {
            creep.memory.state = CreepState.UPGRADING;
          } else {
            creep.memory.state = CreepState.BUILDING;
          }
        }
        break;
      }

      case CreepState.BUILDING: {
        if (creep.store[RESOURCE_ENERGY] === 0) {
          creep.memory.state = CreepState.GET_ENERGY;
          this.work(creep);
          break;
        }

        let target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {filter: obj => obj.structureType !== STRUCTURE_ROAD});
        if (!target)
          target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {filter: obj => obj.structureType === STRUCTURE_ROAD});

        if(target) {

          let room = Memory.rooms[creep.memory.roomName];
          let spawnName = room.spawnNames[0];
          const structureSpawn = Game.spawns[spawnName];
          if (linearRoomDist(creep.pos, structureSpawn.pos) === 1) {
            let creepPos = roomPosToPos(creep.pos);
            const roomPos = roomPosToPos(structureSpawn.pos);
            const diff = subtractPos(creepPos, roomPos);
            creepPos = addPos(addPos(creepPos, diff), diff);
            creep.memory.path = creep.pos.findPathTo(creepPos.x, creepPos.y);
            return;
          }

          if(creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
          }
        } else {
          creep.memory.state = CreepState.UPGRADING;
          this.work(creep);
        }
        break;
      }

      case CreepState.UPGRADING: {
        if (creep.store[RESOURCE_ENERGY] === 0) {
          creep.memory.state = CreepState.GET_ENERGY;
          this.work(creep);
          break;
        }

        let controller = Game.rooms[creep.memory.roomName].controller;
        if (controller) {
          if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE){
            creep.moveTo(controller);
          }
        }

        break;
      }

      case CreepState.DEPOSIT_MINED: {
        if (creep.store[RESOURCE_ENERGY] === 0) {
          creep.memory.state = CreepState.GET_ENERGY;
          this.work(creep);
          break;
        }

        let room = Memory.rooms[creep.memory.roomName];
        let spawnName = room.spawnNames[0];
        const structureSpawn = Game.spawns[spawnName];
        if (structureSpawn && structureSpawn.store[RESOURCE_ENERGY] < structureSpawn.store.getCapacity(RESOURCE_ENERGY)) {
          if(creep.transfer(structureSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(structureSpawn);
          }
        } else {
          creep.memory.state = CreepState.GET_ENERGY;
        }
      }
    }
  },

  create(room: Room, spawn: StructureSpawn, maxEnergy: number): CreepSpawn<WorkerMemory> {
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
        assignedSourceId: this.findEmptySourceId(),
        name: name,
        state: CreepState.GET_ENERGY,
        tookEnergyFromSpawn: false,
        path: undefined
      }
    }
  },

  findEmptySourceId(): Id<MemSource> | undefined {
    for (const sourceId of Memory.sourceIds) {
      const source = Game.getObjectById<MemSource>(sourceId);
      if (!source) {
        throw "";
      }
      if (source.memory.availableSpots > source.memory.assignedCreepNames.length) {

        return source.id;
      }
    }

    return undefined;
  },

  onDestroy(creep: Creep) {

  },

  onSpawn(creep: Creep) {
    let roomName = creep.memory.roomName;
    Game.rooms[roomName].memory.creepNames.push(creep.name);

    let flagName = Game.getObjectById<MemSource>(creep.memory.assignedSourceId ?? "")?.memory.flagName;
    if (flagName) {
      let sourceId = Memory.sourceIds.filter(id => Game.getObjectById<MemSource>(id)?.memory.flagName === flagName)[0];
      Game.getObjectById<MemSource>(sourceId)?.memory.assignedCreepNames.push(creep.name);
    }
  }
}
