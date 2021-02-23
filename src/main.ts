import { ErrorMapper } from "utils/ErrorMapper";
import {roomDirector} from "./roomDirector";
import {jobs} from "./jobs";
import {creepDirector} from "./creeps/creepDirector";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code

const initMemory = () => {
  if (Memory.spawningSpawns === undefined) {
    Memory.spawningSpawns = [];
  }
}

let cleared = true;

const clearMemory = () => {
  for (const name in Memory) {
      delete (Memory as any)[name];
  }
}

export const loop = ErrorMapper.wrapLoop(() => {
  // console.log(`Current game tick is ${Game.time}`);

  if (!cleared) {
    clearMemory();
    cleared = true;
  }

  initMemory();

  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  if (!jobs.run()) {
    return;
  }

  roomDirector.run();
  creepDirector.run();
});
