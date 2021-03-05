interface MissingStructure {
  type: BuildableStructureConstant,
  pos: Pos
}

interface Pos {
  x: number,
  y: number
}

export const buildingManager = {
  manage(roomName: string) {
    const room = Game.rooms[roomName];

    const structure = this.findMissingStructure(room);

    if (structure) {
      room.createConstructionSite(
        structure.pos.x,
        structure.pos.y,
        structure.type
      )
    }
  },

  findMissingStructure(room: Room): MissingStructure | undefined {

    const missingExtension = this.findMissingExtension(room);

    if (missingExtension) {
      return missingExtension;
    }

    return undefined;
  },

  findMissingExtension(room: Room): MissingStructure | undefined {
    const extensions = this.find(room, STRUCTURE_EXTENSION);
    const extensionConstructions = room.find(FIND_CONSTRUCTION_SITES)
      .filter(value => value.structureType === STRUCTURE_EXTENSION);

    const controller = room.controller;
    if (!controller) {
      throw "";
    }
    const maxAmount = CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][controller?.level];
    if (extensions.length + extensionConstructions.length < maxAmount) {
      const spawn = Game.spawns[room.memory.spawnNames[0]];
      const spawnPos = spawn.pos;

      const grid = this.createGrid(maxAmount);
      for (const pos of grid) {
        const x = pos.x + spawnPos.x;
        const y = pos.y + spawnPos.y;
        const constructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
        const structures = room.lookForAt(LOOK_STRUCTURES, x, y);
        const notWall = room.lookForAt(LOOK_TERRAIN, x, y)
          .filter(value => value === "plain")

        if (constructionSites.length || structures.length || !notWall.length) {
          continue;
        }

        return {
          type: STRUCTURE_EXTENSION,
          pos: {
            x: x,
            y: y
          }
        }
      }
    } else {
      return undefined;
    }
    console.log("Cannot find spot for extension");
    throw "";
  },

  find<T extends StructureConstant>(room: Room, type: T): OwnedStructure<T>[] {
    return room.find(FIND_STRUCTURES)
      .filter(structure => structure.structureType === type)
      .map(value => (value as OwnedStructure<T>));
  },

  findConstructionSites<T extends BuildableStructureConstant>(room: Room, type: T): ConstructionSite<T>[] {
    return room.find(FIND_CONSTRUCTION_SITES)
      .filter(site => site.structureType === type)
      .map(site => (site as ConstructionSite<T>));
  },

  createGrid(max: number): Pos[] {
    let positions: Pos[] = [];

    const sideLen = Math.max(Math.ceil(Math.sqrt(max * 2 + 1)), 3);
    const halfSideLen = Math.floor(sideLen / 2);

    for (let x = -halfSideLen; x <= halfSideLen; x++) {
      for (let y = -halfSideLen; y <= halfSideLen; y++) {
        if ((x + y) % 2 === 0) {
          positions.push({
            x: x,
            y: y
          });
        }
      }
    }

    positions.sort((a, b) => {
      return Math.sqrt(a.x * a.x + a.y * a.y) - Math.sqrt(b.x * b.x + b.y * b.y);
    });

    return positions;
  }
}