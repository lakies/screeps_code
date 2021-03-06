import {roadBuilder} from "./roadBuilder";
import {linearDist, linearRoomDist} from "../common";

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

    if (room.energyCapacityAvailable > 400) {
      roadBuilder.build(room);
    }
  },

  findMissingStructure(room: Room): MissingStructure | undefined {

    const missingExtension = this.findMissingExtension(room);

    if (missingExtension) {
      return missingExtension;
    }

    const missingContainer = this.findMissingContainers(room);
    if (missingContainer) {
      return missingContainer;
    }

    const missingTower = this.findMissingTowers(room);
    if (missingTower) {
      return missingTower;
    }

    const missingStorage = this.findMissingStorage(room);
    if (missingStorage) {
      return missingStorage;
    }
    return undefined;
  },

  findMissingContainers(room: Room): MissingStructure | undefined {

    if (room.energyCapacityAvailable < 550) {
      return;
    }

    const containers = this.find(room, STRUCTURE_CONTAINER);
    const containerConstructions = room.find(FIND_CONSTRUCTION_SITES)
      .filter(value => value.structureType === STRUCTURE_CONTAINER);

    const controller = room.controller;
    if (!controller) {
      throw "";
    }
    const maxAmount = Math.min(CONTROLLER_STRUCTURES[STRUCTURE_CONTAINER][controller?.level], 3);

    if (containerConstructions.length == 0 && containers.length < maxAmount) {
      const spawn = Game.spawns[room.memory.spawnNames[0]];
      const spawnPos = spawn.pos;

      const grid = this.createGrid(maxAmount, false);
      for (const pos of grid) {
        const x = pos.x + spawnPos.x;
        const y = pos.y + spawnPos.y;
        const constructionSites = room.lookForAt(LOOK_CONSTRUCTION_SITES, x, y);
        const structures = room.lookForAt(LOOK_STRUCTURES, x, y).filter(value => value.structureType !== STRUCTURE_ROAD);
        const notWall = room.lookForAt(LOOK_TERRAIN, x, y)
          .filter(value => value === "plain");

        console.log(JSON.stringify(notWall));

        if (constructionSites.length || structures.length || !notWall.length) {
          continue;
        }

        return {
          type: STRUCTURE_CONTAINER,
          pos: {
            x: x,
            y: y
          }
        }
      }
    } else {
      return undefined;
    }
    console.log("Cannot find spot for container");
    throw "";

  },

  findMissingTowers(room: Room): MissingStructure | undefined {
    const towers = this.find(room, STRUCTURE_TOWER);
    const towersConstructions = room.find(FIND_CONSTRUCTION_SITES)
      .filter(value => value.structureType === STRUCTURE_TOWER);

    const controller = room.controller;
    if (!controller) {
      throw "";
    }
    const maxAmount = CONTROLLER_STRUCTURES[STRUCTURE_TOWER][controller?.level];

    if (towersConstructions.length == 0 && towers.length < maxAmount) {
      const spawn = Game.spawns[room.memory.spawnNames[0]];
      const spawnPos = spawn.pos;
      return {
        type: STRUCTURE_TOWER,
        pos: {
          x: spawnPos.x + 1,
          y: spawnPos.y + 1
        }
      }
    }

    return undefined;
  },

  findMissingStorage(room: Room): MissingStructure | undefined {
    const storages = this.find(room, STRUCTURE_STORAGE);
    const storageConstructions = room.find(FIND_CONSTRUCTION_SITES)
      .filter(value => value.structureType === STRUCTURE_STORAGE);

    const controller = room.controller;
    if (!controller) {
      throw "";
    }
    const maxAmount = CONTROLLER_STRUCTURES[STRUCTURE_STORAGE][controller?.level];

    if (storageConstructions.length == 0 && storages.length < maxAmount) {
      const spawn = Game.spawns[room.memory.spawnNames[0]];
      const spawnPos = spawn.pos;
      return {
        type: STRUCTURE_STORAGE,
        pos: {
          x: spawnPos.x + 1,
          y: spawnPos.y - 1
        }
      }
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
    if (extensionConstructions.length == 0 && extensions.length < maxAmount) {
      const spawn = Game.spawns[room.memory.spawnNames[0]];
      const spawnPos = spawn.pos;

      const grid = this.createGrid(maxAmount, true);
      for (const pos of grid) {
        if (linearDist(pos, {x: 0, y: 0}) < 2) {
          continue;
        }
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

  createGrid(max: number, diagonal: boolean): Pos[] {
    let positions: Pos[] = [];

    const sideLen = Math.max(Math.ceil(Math.sqrt(max * 2 + 1)), 3) + 2;
    const halfSideLen = Math.floor(sideLen / 2);

    for (let x = -halfSideLen; x <= halfSideLen; x++) {
      for (let y = -halfSideLen; y <= halfSideLen; y++) {
        if ((x + y) % 2 === (diagonal ? 0 : 1)) {
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
