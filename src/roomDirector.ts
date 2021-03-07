import {creepManager} from "./creeps/creepManager";
import {buildingManager} from "./buildings/buildingManager";

export const roomDirector = {

  run(): void {
    for (const roomName of this.getOwnedRoomNames()) {
      this.manageRoom(roomName);

      if (Game.time % 10 == 0) {
        this.checkSources(roomName)
      }
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

    if (Game.time % 20 == 1) {
      buildingManager.manage(roomName);
    }
  },

  getAvailableSpots(room: Room, pos: RoomPosition): number {
    const surroundingWalls = room.lookForAtArea(LOOK_TERRAIN, pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1, true)
      .filter(tile => tile.terrain === "wall");
    return 9 - surroundingWalls.length;
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


        const mineableSource = source as MemSource;
        mineableSource.memory.flagName = flags[0].name;
        mineableSource.memory.availableSpots = this.getAvailableSpots(room, source.pos);
        mineableSource.memory.assignedCreepNames = [];
        mineableSource.memory.needMiner = true;
        mineableSources.push(mineableSource);
      }
    }

    Memory.sourceIds =  mineableSources.map(value => value.id);

    return Memory.sourceIds;
  },

  checkSources(roomName: string) {
    const room = Game.rooms[roomName];
    for (const sourceId of room.memory.sourceIds) {
      const source = Game.getObjectById<MemSource>(sourceId);
      if (!source) {
        continue;
      }

      if (source.memory.minerName && source.memory.availableSpots > 0) {
        source.memory.availableSpots = 0;
      }

      if (!source.memory.minerName && source.memory.availableSpots === 0) {
        if (source.memory.timeWithoutMiners === undefined) {
          source.memory.timeWithoutMiners = 5;
        }

        console.log("Source " + source.id + " has no miner");
        source.memory.timeWithoutMiners--;

        if (source.memory.timeWithoutMiners === 0) {
          source.memory.availableSpots = this.getAvailableSpots(room, source.pos);
        }
      }
    }
  }

};
