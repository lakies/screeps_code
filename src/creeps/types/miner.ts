import {CreepRole, CreepState, makeid} from "../../common";

export const miner = {
  work(creep: Creep) {
    let id = creep.memory.assignedSourceId;
    if (!id) {
      return;
    }

    let source = Game.getObjectById<Source>(id);
    if (!source) {
      return;
    }


    // if (!creep.memory.working) {
    //   if (creep.harvest(source) === ERR_NOT_IN_RANGE){
    //     creep.moveTo(source);
    //     return;
    //   } else {
    //     creep.memory.working = true;
    //     // TODO: log time that the creep has lived to spawn a new one when needed
    //   }
    // }

    if (creep.harvest(source) === ERR_NOT_IN_RANGE){
      creep.moveTo(source);
      return;
    }

    const resources = creep.pos.lookFor<LOOK_RESOURCES>(LOOK_RESOURCES);
    if (resources.length) {
      (creep as Miner).memory.needHauler = resources[0].amount > 200;
    }
  },


  create(room: Room, spawn: StructureSpawn, maxEnergy: number): CreepSpawn<MiningCreepMemory> {
    const base = [WORK, WORK, WORK, WORK, WORK, MOVE];
    // TODO: maybe add more moves so that the miner arrives earlier

    let name = "miner_" + makeid();
    return {
      spawnName: spawn.name,
      parts: base,
      name: name,
      memory: {
        role: CreepRole.MINER,
        roomName: room.name,
        working: false,
        assignedSourceId: undefined,
        name: name,
        state: CreepState.BUILDING,
        assignedHaulerName: undefined,
        needHauler: false
      }
    }
  },

  onDestroy(creep: Creep) {
    const miner = creep as Miner;

    const haulerName = miner.memory.assignedHaulerName;
    if (haulerName) {
      (Game.creeps[haulerName] as Hauler).memory.minerName = undefined;
      miner.memory.assignedHaulerName = undefined;
      miner.memory.needHauler = false;

    }

    const memory = (Game.getObjectById<MemSource>(miner.memory.assignedSourceId as Id<MemSource>) as MemSource).memory;

    console.log("setting undefined");
    memory.minerName = undefined;
    memory.needMiner = true;

  },

  onSpawn(creep: Creep) {
    let roomName = creep.memory.roomName;
    Game.rooms[roomName].memory.creepNames.push(creep.name);

    let sourceId = Memory.sourceIds.filter(id => Game.getObjectById<MemSource>(id)?.memory.needMiner)[0];
    console.log(sourceId);
    creep.memory.assignedSourceId = sourceId;
    const memory = (Game.getObjectById<MemSource>(sourceId) as MemSource).memory;
    memory.minerName = creep.name;
    memory.needMiner = false;

    console.log(JSON.stringify(memory));
  }
}
