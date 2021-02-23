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

    for (const spawn of Memory.spawningSpawns) {

      console.log(JSON.stringify(Game.spawns[spawn.name].spawning));
      let name = Game.spawns[spawn.name].spawning?.name;
      if (!name) {
        notReady.push(spawn);
        continue;
      }

      const creep = Game.creeps[name];
      let room = creep.memory.room;
      Game.rooms[room.name].memory.creeps.push(creep);

      let flagName = creep.memory.assignedSource?.flagName;
      if (flagName) {
        Memory.sources.filter(value => value.flagName === flagName)[0].assignedCreeps.push(creep);
      }
    }

    Memory.spawningSpawns = notReady;
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
