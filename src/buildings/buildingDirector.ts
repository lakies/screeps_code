export const buildingDirector = {
  run(roomName: string) {
    const room = Game.rooms[roomName];

    const tower = this.getTower(room);
    if (!tower) {
      return;
    }

    const hostile = this.getHostile(tower);
    if (hostile) {
      tower.attack(hostile);
      return;
    }

    const targets = room.find(FIND_STRUCTURES, {
      filter: object => object.hits < object.hitsMax
    });

    targets.sort((a,b) => a.hits - b.hits);

    tower.repair(targets[0]);
  },

  getTower(room: Room): StructureTower | null {
    const towerId = room.memory.towerId;
    if (!towerId) {
      const towers = room.find(FIND_STRUCTURES).filter(value => value.structureType === STRUCTURE_TOWER);
      if (!towers.length) {
        return null;
      }
      const tower = towers[0] as StructureTower;
      room.memory.towerId = tower.id;
    }
    return Game.getObjectById<StructureTower>(room.memory.towerId as Id<StructureTower>);
  },

  getHostile(tower: StructureTower): Creep | null {
    return tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  }
}
