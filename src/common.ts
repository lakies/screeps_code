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
