import {creepManager} from "./creeps/creepManager";
import {buildingManager} from "./buildings/buildingManager";

export const roomDirector = {

  run(): void {
    for (const roomName of this.getOwnedRoomNames()) {
      this.manageRoom(roomName);
    }
  },


  getOwnedRoomNames(): string[] {
    // Assumes only one spawn per room
    if (!Memory.ownedRoomNames) {
      let roomNames: string[] = [];
      for (const spawnName in Game.spawns) {
        let spawn = Game.spawns[spawnName];
        let room: Room = spawn.room;
        room.memory.spawnNames = [spawn.name];
        room.memory.satelliteRoomNames = [];
        room.memory.sourceIds = this.getMineableSources(room);
        room.memory.creepNames = [];
        roomNames.push(room.name);
      }

      Memory.ownedRoomNames = roomNames;
    }

    return Memory.ownedRoomNames;
  },

  manageRoom(roomName: string): void {
    if (Game.time % 5 == 0) {
      creepManager.manage(roomName);
    }

    if (Game.time % 20 == 0) {
      buildingManager.manage(roomName);
    }
  },

  getMineableSources(room: Room): Id<MemSource>[] {
    let roomMemory = room.memory;
    const mineableSources: MemSource[] = [];

    for (const satelliteRoom of roomMemory.satelliteRoomNames) {

    }

    for (const source of room.find(FIND_SOURCES)) {
      let flags = source.pos.findInRange(FIND_FLAGS, 1);
      if (flags.length === 0)
        continue;

      flags = flags.filter(flag => flag.name.startsWith("source_"));
      if (flags.length > 0) {
        let surroundingWalls = room.lookForAtArea(LOOK_TERRAIN, source.pos.y - 1, source.pos.x - 1, source.pos.y + 1, source.pos.x + 1, true)
          .filter(tile => tile.terrain === "wall");

        const mineableSource = source as MemSource;
        mineableSource.memory.flagName = flags[0].name;
        mineableSource.memory.availableSpots = 9 - surroundingWalls.length;
        mineableSource.memory.assignedCreepNames = [];
        mineableSources.push(mineableSource);
      }
    }

    Memory.sourceIds =  mineableSources.map(value => value.id);

    return Memory.sourceIds;
  }

};
