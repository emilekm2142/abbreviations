import {Player} from './Player';
import {State} from './State';

export class Room {
  name: string;
  date: Date;
  history=[]
  hidden:boolean;
  hashesToPlayersIds={};
  propositions=[];
  players: Player[]=[];
  state: State;
  currentAbbreviation: string;
  hash:string;
  maxPlayers:number;


}
export class RoomDTO{
  name:string;

}
