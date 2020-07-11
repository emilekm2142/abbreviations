import {EventEmitter, Injectable, isDevMode, Output} from '@angular/core';

import * as socketIo from 'socket.io-client';
import {Room} from './models/Room';
import {Router} from '@angular/router';

let SERVER_URL = 'https://0.0.0.0';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  public socket;
  public rooms: Room[] = [];
  @Output() roomUpdated: EventEmitter<any> = new EventEmitter();
  constructor(private router: Router) {
    SERVER_URL = isDevMode() ? 'http://localhost:80' : 'https://abbreviation.herokuapp.com';
    this.initSocket();
  }
  public initSocket(): void {
    this.socket = socketIo(SERVER_URL);
    this.getRooms();
    this.socket.on('updateRooms', (data) => {
      console.log(data);
      this.rooms = data;
      this.roomUpdated.emit();
    });
    this.socket.on("returnToMain", (d)=>{
      console.log("return")
      this.router.navigate([''])
    });
  }
  public makeGame(name, hidden, maxPlayers) {
    console.log(hidden);
    if (name) {
      this.socket.emit('makeRoom', {name: name, hidden: hidden, maxPlayers: maxPlayers}, (d) => {
        if (d) {
          this.router.navigate(['/room', d]);
        }
      });

    }

  }
  getMe(callback) {
    this.socket.emit('getMe', {}, callback);
  }
  public getRooms() {
    this.socket.emit('getRooms', {}, (d) => {
      console.log('xd!');
      this.rooms = d;
    });
  }
  public getRoom(callback) {
    this.socket.emit('getRoom', {}, callback);
  }
  public joinRoom(hash, callback) {
    this.socket.emit('joinGame', {hash: hash}, callback );
  }
  public kick(player){
    this.socket.emit("kick", player, (d)=>{});
  }
}
