import {EventEmitter, Injectable, Output} from '@angular/core';

import * as socketIo from 'socket.io-client';
import {Room} from './models/Room';
import {Router} from '@angular/router';
import {PlayerService} from './player.service';
import {Player} from './models/Player';

const SERVER_URL = 'http://localhost:8080';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public socket;
  public rooms: Room[] = [];
  @Output() roomUpdated:EventEmitter<any> = new EventEmitter()
  constructor(private router: Router) {
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

}
