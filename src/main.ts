import {ErrorMapper} from "utils/ErrorMapper";
import {roomDirector} from "./roomDirector";
import {jobs} from "./jobs";
import {creepDirector} from "./creeps/creepDirector";
import {prototypes} from "./prototypes";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code

const initMemory = () => {
  if (Memory.spawningSpawnNames === undefined) {
    Memory.spawningSpawnNames = [];
  }
}

let cleared = true;

const clearMemory = () => {
  for (const name in Memory) {
    delete (Memory as any)[name];
  }
}

prototypes.load();

export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);

  if (!cleared) {
    clearMemory();
    cleared = true;
  }

  initMemory();

  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      let creep = Memory.creeps[name];
      let room = Game.rooms[creep.roomName];
      room.memory.creepNames = room.memory.creepNames.filter(name => name !== creep.name);
      let sourceId = creep.assignedSourceId;
      if (sourceId !== undefined) {
        let assignedSourceId = Memory.sourceIds.filter(value => Game.getObjectById<MemSource>(value)?.memory.flagName === Game.getObjectById<MemSource>(sourceId ?? "")?.memory.flagName)[0];
        const source = Game.getObjectById<MemSource>(assignedSourceId) ?? {} as MemSource;
        source.memory.assignedCreepNames = source.memory.assignedCreepNames.filter(name => name !== creep.name);
      }
      console.log(`Creep ${name} has been destroyed`)
      delete Memory.creeps[name];
    }
  }

  if (!jobs.run()) {
    return;
  }

  roomDirector.run();
  creepDirector.run();
});
