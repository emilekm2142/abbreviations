import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {Room} from '../../models/Room';
import {SocketService} from '../../socket.service';
import {Player} from '../../models/Player';
import {PlayerService} from '../../player.service';
import {State} from '../../models/State';
import {animate, style, transition, trigger} from '@angular/animations';
import {MatButton} from '@angular/material';

@Component({
  selector: 'app-game-page',
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ opacity: 0, overflow:'hidden', height:0}),
          animate('500ms', style({ opacity: 1, height:"*"}))
        ]),
        transition(':leave', [
          style({opacity: 1, overflow:'hidden'}),
          animate('500ms', style({opacity: 0, height:0}))
        ])
      ]
    )]
})
export class GamePageComponent implements OnInit {
  task = '';
  solution = '';
  id;
  choosen = false;
  get me () {
    return this.pS.me;
  }
  room: Room;
  get name() {
    return this.pS.name;
  }

  constructor(private pS: PlayerService, private route: ActivatedRoute, private s: SocketService) { }
  get State() {
    return State;
  }
  ngOnInit() {

    this.id = this.route.snapshot.paramMap.get('room');
    this.s.joinRoom(this.id, (d) => {
      console.log(d);
      this.room = d;

    });
    this.s.socket.on('preChoose', (data) => {
      this.choosen = true;
      for (const x of this.room.propositions) {  x.win = (x.temporalHash === data.temporalHash); }
    });
    this.s.socket.on('updateState', (data) => {
      this.room = data;
      console.log(this.room);
      if (!this.me) {
        this.s.getMe((me) => {
          this.pS.me = this.room.players.filter(d => d.id === me.id)[0];
        //  console.log(me);
        });
      } else {
        this.pS.me = this.room.players.filter(d => d.id === this.me.id)[0];
      }
    });
    this.s.roomUpdated.subscribe(() => {

    });



  }
  get isEveryoneReady() {
    for (const x of this.room.players) {
      if (!x.ready) {return false; }
    }
    return true;
  }
  start() {
    if (this.isEveryoneReady) {
      this.s.socket.emit('start', {});
    }
  }
  setTask() {
    if (this.task.length > 1) {
      this.s.socket.emit('setTask', {task: this.task});
    }
  }
  getRandom() {
    this.s.socket.emit('getRandom', 2, (d) => {
      this.task = d;
    });
  }
  setSolution() {
    if (this.solution.length > 1) {
      this.s.socket.emit('sendSolution', {solution: this.solution});
    }
  }
  choose(hash) {
    if (this.me.isCzar) {
      this.s.socket.emit('preChoose', {temporalHash: hash});

      setTimeout(() => {
        this.s.socket.emit('choose', {temporalHash: hash}, (d) => {
        });
        this.choosen=false;
      }, 3000);

    }
  }
  makeReady(){
    this.me.ready=true;
    this.s.socket.emit("ready")
  }

}
