import {creepManager} from "./creeps/creepManager";

export const roomDirector = {

  run(): void {
    for (const room of this.getOwnedRooms()) {
      this.manageRoom(room);
    }
  },


  getOwnedRooms(): Room[] {
    // Assumes only one spawn per room
    if (!Memory.ownedRooms) {
      let rooms: Room[] = [];
      for (const spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName];
        let room: Room = spawn.room;
        room.memory.spawns = [spawn];
        room.memory.satelliteRooms = [];
        room.memory.sources = this.getMineableSources(room);
        room.memory.creeps = [];
        rooms.push(room);
      }

      Memory.ownedRooms = rooms;
    }

    return Memory.ownedRooms;
  },

  manageRoom(room: Room): void {
    if (Game.time % 5 == 0) {
      creepManager.manage(room);
    }
  },

  getMineableSources(room: Room): MineableSource[] {
    let roomMemory = room.memory;
    const mineableSources: MineableSource[] = [];

    for (const satelliteRoom of roomMemory.satelliteRooms) {

    }

    for (const source of room.find(FIND_SOURCES)) {
      let flags = source.pos.findInRange(FIND_FLAGS, 1);
      if (flags.length === 0)
        continue;

      flags = flags.filter(flag => flag.name.startsWith("source_"));
      if (flags.length > 0) {
        let surroundingWalls = room.lookForAtArea(LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true)
          .filter(tile => tile.terrain === "wall");

        const mineableSource = source as MineableSource;
        mineableSource.flagName = flags[0].name;
        mineableSource.availableSpots = 9 - surroundingWalls.length;
        mineableSource.assignedCreeps = [];
        mineableSources.push(mineableSource);
      }
    }

    Memory.sources =  mineableSources;

    return Memory.sources;
  }

};
