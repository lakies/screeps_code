let flagsPlaced = false;
let flagCount = 0;

export const jobs = {
  run(): boolean {
    let canInit = true;
    canInit = canInit && this.checkSpawningCreeps();
    canInit = canInit && this.placeFlags();
    return canInit;
  },

  checkSpawningCreeps(): boolean {
    const notReady: StructureSpawn[] = [];

    for (const spawnName of Memory.spawningSpawnNames) {
      const spawn = Game.spawns[spawnName];
      console.log("Setting memory for new creep");
      let name = Game.spawns[spawn.name].spawning?.name;
      if (!name) {
        notReady.push(spawn);
        continue;
      }

      const creep = Game.creeps[name];
      let roomName = creep.memory.roomName;
      Game.rooms[roomName].memory.creepNames.push(creep.name);

      let flagName = Game.getObjectById<MemSource>(creep.memory.assignedSourceId ?? "")?.memory.flagName;
      if (flagName) {
        let sourceId = Memory.sourceIds.filter(id => Game.getObjectById<MemSource>(id)?.memory.flagName === flagName)[0];
        Game.getObjectById<MemSource>(sourceId)?.memory.assignedCreepNames.push(creep.name);
      }
    }

    Memory.spawningSpawnNames = notReady.map(value => value.name);
    return true;
  },

  placeFlags() {
    if (flagsPlaced) {
      return true;
    }
    flagsPlaced = true;

    for (const roomName in Game.rooms) {
      let room = Game.rooms[roomName];
      let sources = room.find(FIND_SOURCES);
      for (const source of sources) {
        let flags = source.pos.findInRange(FIND_FLAGS, 1);
        if (!flags.length) {
          console.log("Placing flag ");
          room.createFlag(source.pos.x, source.pos.y, "source_" + flagCount++, COLOR_YELLOW);
        }
      }
    }
    return false;
  }
}
