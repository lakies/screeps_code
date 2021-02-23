import {creepSpawning} from "./creepSpawning";
import {CreepRole} from "../common";

interface RequiredCreep {
  type: string;
  count: string;
}

interface ExistingCreeps {
  [x: number]: number
}
export const creepManager = {
  manage(room: Room) {
    // Game.

    if (Game.time % 5 == 0) {
      let creepSpawns = this.calculateMissingCreeps(room);
      if (creepSpawns.length) {
        this.spawnCreeps(room, creepSpawns);
      }
    }
  },

  spawnCreeps(room: Room, neededCreeps: CreepSpawn[]) {
    const roomMemory = Memory.rooms[room.name];

    const newCreep = neededCreeps[0];
    const spawn = Game.spawns[roomMemory.spawns[0].name];

    const res = spawn.spawnCreep(newCreep.parts, newCreep.name, {
      memory: newCreep.memory
    })

    if (res === OK) {
      console.log("Spawning new creep " + newCreep.name);
      Memory.spawningSpawns.push(spawn);
    } else {
      console.log("Failed to spawn creep: " + res);
    }
  },

  calculateMissingCreeps(room: Room): CreepSpawn[] {
    let roomMemory = Memory.rooms[room.name];
    let capacityAvailable = room.energyCapacityAvailable;

    // how many creeps are currently needed
    const requiredCreeps: ExistingCreeps = {};
    if (capacityAvailable < 550) {
      const maxMiners = roomMemory.sources.reduce<number>((previousValue, currentValue) => {
        return previousValue + currentValue.availableSpots;
      }, 0)

      requiredCreeps[CreepRole.WORKER] = maxMiners;
    }

    // count existing creeps and their roles
    const roles = roomMemory.creeps.map(value => Memory.creeps[value.name].role)
      .reduce<ExistingCreeps>((previousValue: ExistingCreeps, currentValue: CreepRole) => {
        if (!previousValue[currentValue]) {
          previousValue[currentValue] = 0;
        }
        previousValue[currentValue]++;
        return previousValue;
      }, {} as ExistingCreeps);

    // find how many creeps are missing
    for (const role in roles) {
      const count = roles[role];
      if (requiredCreeps[role]) {
        requiredCreeps[role] -= count;
      }
    }

    // create CreepSpawn instances based on missing creeps
    const missingCreeps: CreepSpawn[] = [];
    for (const role in requiredCreeps) {
      const count = requiredCreeps[role];

      for (let i = 0; i < count; i++) {
        missingCreeps.push(creepSpawning.createCreep(roomMemory.spawns[0], parseInt(role), room.energyAvailable, room))
      }
    }


    return missingCreeps;
  },


};
