export const roadBuilder = {
  build(room: Room) {
    const sourceIds = room.memory.sourceIds;
    const spawn = Game.spawns[room.memory.spawnNames[0]];

    for (const sourceId of sourceIds) {
      const source = Game.getObjectById<MemSource>(sourceId);
      if (!source) {
        continue;
      }

      if (!source.memory.roadBuilt) {
        this.buildRoad(room, spawn.pos, source.pos);
        source.memory.roadBuilt = true;
      }
    }

    const controller = room.controller as MemController;
    if (!controller.memory.roadBuilt) {
      this.buildRoad(room, spawn.pos, controller.pos);
      controller.memory.roadBuilt = true;
    }


    // TODO: satellite rooms
  },

  buildRoad(room: Room, from: RoomPosition, to: RoomPosition) {
    const steps = from.findPathTo(to);
    for (const step of steps) {
      const structures = room.lookAt(step.x, step.y).filter(value => value.terrain !== "plain");
      if (!structures.length) {
        room.createConstructionSite(step.x, step.y, STRUCTURE_ROAD)
      }
    }
  }
}
