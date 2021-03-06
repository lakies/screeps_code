export enum CreepRole {
  MINER,
  WORKER,
  DISTRIBUTOR
}

export enum CreepState {
  UPGRADING,
  BUILDING
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
