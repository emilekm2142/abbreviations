import { Injectable } from '@angular/core';
import {SocketService} from './socket.service';
import {Player} from './models/Player';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private nameDebug = false;
  public me: Player;
  private _name: string;

  constructor(private socketService: SocketService) {
    if (!this._name) {
      this.initName();
    }
  }

  initName() {

    this._name = this.nameDebug ? '' : localStorage.getItem('playerName');
    this.changeName(this._name);

  }

  private saveName() {
    localStorage.setItem('playerName', this._name);
    this.socketService.socket.emit('changeName', {name: this.name}, (d) => {
    });
  }

  get name(): string {
    return this._name;
  }

  changeName(n: string) {
    this._name = n;
    this.saveName();
  }

  getMe() {
    this.socketService.getMe((d) => {
      this.me = d;
    });
  }

}
