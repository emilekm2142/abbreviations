import {Component, OnInit, Output} from '@angular/core';
import {SocketService} from '../../socket.service';
import {EventEmitter} from '@angular/core';

@Component({
  selector: 'app-game-creator',
  templateUrl: './game-creator.component.html',
  styleUrls: ['./game-creator.component.scss']
})
export class GameCreatorComponent implements OnInit {
  name;
  hidden;
  maxPlayers;

  constructor(private s:SocketService) { }

  ngOnInit() {
  }
  create(){
    this.s.makeGame(this.name,this.hidden,this.maxPlayers);
  }

}
