export enum CreepRole {
  WORKER,
  HAULER,
  MINER,
}

export enum CreepState {
  UPGRADING,
  BUILDING,
  FILL_EXTENSION,
  FETCH_MINED,
  DEPOSIT_MINED,
  MINING,
  GET_ENERGY
}

export const makeid = (): string => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < 10; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const linearDist = (pos1: RoomPosition, pos2: RoomPosition): number => {
  const diffX = pos1.x - pos2.x;
  const diffY = pos1.y - pos2.y;
  return Math.sqrt(diffX * diffX + diffY * diffY);
}

export const roomPosToPos = (pos: RoomPosition): Pos => {
  return {
    x: pos.x,
    y: pos.y
  }
};

export const addPos = (pos1: Pos, pos2: Pos): Pos => {
  return {
    x: pos1.x + pos2.x,
    y: pos1.y + pos2.y
  }
}


export const subtractPos = (pos1: Pos, pos2: Pos): Pos => {
  return {
    x: pos1.x - pos2.x,
    y: pos1.y - pos2.y
  }
}
