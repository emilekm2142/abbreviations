import {Component, Input, OnInit} from '@angular/core';
import {Player} from '../../models/Player';
import {Room} from '../../models/Room';
import {PlayerService} from '../../player.service';
import {State} from '../../models/State';
import {SocketService} from '../../socket.service';

@Component({
  selector: 'app-players-list',
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.css']
})
export class PlayersListComponent implements OnInit {
  @Input() players:Player[];
  get me(){
    return this.pS.me;
  }
  @Input() room:Room;
  get State(){
    return State;
  }
  constructor(private pS:PlayerService, private s:SocketService) { }

  ngOnInit() {
  }
  makeReady(){
    this.me.ready=true;
    this.s.socket.emit("ready")
  }

}
