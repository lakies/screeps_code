import {CreepRole, CreepState, makeid} from "../../common";

export const attacker = {
  work(creep: Creep) {
    this.runState(creep as Attacker);

  },
  runState(creep: Attacker) {
    switch (creep.memory.state) {
      case CreepState.ATTACKING: {

        if (!creep.memory.targetFlagName) {
          for (const flagName in Game.flags) {
            const flag = Game.flags[flagName];
            if (flag.name.startsWith("attack_")) {
              creep.memory.targetFlagName = flag.name;
              break;
            }
          }
        }

        const targetFlagName = creep.memory.targetFlagName;
        if (!targetFlagName) {
          return;
        }
        const flag = Game.flags[targetFlagName];

        if (!flag) {
          creep.memory.targetFlagName = undefined;
        }

        if (creep.pos.roomName !== flag.pos.roomName) {
          if (creep.memory.movePath) {
            if (creep.room.name === creep.memory.lastRoomName) {
              const pathStep = creep.memory.movePath[creep.memory.movePath.length - 1];
              creep.moveTo(pathStep.x, pathStep.y);
              return;
            } else {
              creep.memory.movePath = undefined;
            }

            // const pathStep = creep.memory.movePath[creep.memory.movePath.length - 1];
            // if (creep.pos.x === pathStep.x && creep.pos.y === pathStep.y) {
            //   creep.memory.movePath = undefined;
            // } else {
            //   creep.moveByPath(creep.memory.movePath);
            //
            //   return;
            // }

            creep.memory.lastRoomName = creep.room.name;
          }

          const steps = creep.pos.findPathTo(flag.pos);

          if (steps.length) {
            creep.memory.movePath = steps;
            this.work(creep);
            return;
          } else {
            console.log("No path found to target flag");
            flag.remove();
          }
        } else {
          const towers = creep.room.find(FIND_STRUCTURES)
            .filter(value => value.structureType === STRUCTURE_TOWER && !value.my);

          if (towers.length) {
            if (creep.attack(towers[0]) === ERR_NOT_IN_RANGE) {
              creep.moveTo(towers[0]);
            }
            return;
          }

          const hostileCreep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
          if (hostileCreep) {
            if (creep.attack(hostileCreep) === ERR_NOT_IN_RANGE) {
              creep.moveTo(hostileCreep);
            }
            return;
          }

          const hostileStructure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: object => {
              return object.structureType !== STRUCTURE_CONTROLLER
            }
          });
          if (hostileStructure) {
            if (creep.attack(hostileStructure) === ERR_NOT_IN_RANGE) {
              creep.moveTo(hostileStructure);
            }
            return;
          }

          flag.remove();
          creep.memory.state = CreepState.WAITING;

        }

        break;
      }

      case CreepState.MOVING: {
        if (creep.pos.roomName === creep.memory.roomName) {

        }
        break;
      }

      case CreepState.WAITING: {
        for (const flagName in Game.flags) {
          const flag = Game.flags[flagName];
          if (flag.name.startsWith("attack_")) {

              creep.memory.state = CreepState.ATTACKING;
              break;
          }
        }

        if ((creep.ticksToLive ?? 1500) < 1450) {
          const spawnName = Game.rooms[creep.memory.roomName].memory.spawnNames[0];
          const spawn = Game.spawns[spawnName];

          if (spawn.renewCreep(creep) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
          }
        }
        break;
      }


      case CreepState.RETURNING: {
        if (creep.pos.roomName === creep.memory.roomName) {

        }
        break;
      }
    }
  },

  create(room: Room, spawn: StructureSpawn, maxEnergy: number): CreepSpawn<AttackerMemory> {
    const base = [MOVE, ATTACK];
    const parts: BodyPartConstant[] = [];

    const number = Math.min(maxEnergy, 130*5);

    for (let i = 0; i < Math.min(20, (maxEnergy - number) / 10); i++) {
      parts.push(TOUGH);
    }

    for (let i = 0; i < Math.floor(number / (50 + 80)); i++) {
      for (const baseElement of base) {
        parts.push(baseElement);
      }
    }



    let name = "attacker_" + makeid();
    return {
      spawnName: spawn.name,
      parts: parts,
      name: name,
      memory: {
        lastRoomName: room.name,
        movePath: undefined,
        targetFlagName: undefined,
        role: CreepRole.ATTACKER,
        roomName: room.name,
        working: false,
        assignedSourceId: undefined,
        name: name,
        state: CreepState.WAITING,
        path: undefined
      }
    }
  },

  onDestroy(creep: Creep) {
    const attacker = creep as Attacker;
    if (attacker.memory.targetFlagName) {
      const flag = Game.flags[attacker.memory.targetFlagName];
      if (flag) {
        flag.memory.attackerName = undefined;
        attacker.memory.targetFlagName = undefined;
      }
    }
  },

  onSpawn(creep: Creep) {
    let roomName = creep.memory.roomName;
    Game.rooms[roomName].memory.creepNames.push(creep.name);
  }
}
