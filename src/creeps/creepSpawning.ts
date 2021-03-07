import {CreepRole, CreepState, makeid} from "../common";
import {worker} from "./types/worker";
import {hauler} from "./types/hauler";
import {miner} from "./types/miner";

export const creepSpawning = {
  createCreep(spawn: StructureSpawn, role: CreepRole, maxEnergy: number, room: Room): CreepSpawn<CreepMemory> {
    switch (role) {
      case CreepRole.MINER:
        return miner.create(room, spawn, maxEnergy)
      case CreepRole.WORKER:
        return worker.create(room, spawn, maxEnergy);
      case CreepRole.HAULER:
        return hauler.create(room, spawn, maxEnergy);
    }

    // shouldnt get here
    // console.log("trying to create a creep with a role not yet specified");
    // return {} as any;
  },
}
