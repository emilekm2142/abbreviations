import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../../player.service';
import {SocketService} from '../../socket.service';
import {animate, style, transition, trigger} from '@angular/animations';
import {Router} from '@angular/router';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ opacity: 0}),
          animate('500ms', style({ opacity: 1}))
        ]),
        transition(':leave', [
          style({opacity: 1}),
          animate('500ms', style({opacity: 0}))
        ])
      ]
    ),
    trigger(
      'slide', [
        transition(':enter', [
          style({height: 0}),
          animate('100ms', style({ height: '*' }))
        ]),
        transition(':leave', [
          style({  height: '*'}),
          animate('100ms', style({ height: 0}))
        ])
      ]
    )
  ]
})
export class PageComponent implements OnInit {
  changingName = false;
  creator = false;
  filter = '';
  pageEvent = {
    length: this.rooms.length,
    pageSize: 25,
    pageIndex: 0
  };
  get playerAmount(): number {
    return this.rooms.reduce((prev, n) => prev + n.players.length, 0);
  }
  constructor(private playerService: PlayerService, private socketService: SocketService, private router: Router) { }
  get name() {

    return this.playerService.name;
  }
  get rooms() {
    return this.socketService.rooms;
  }
  ngOnInit() {
    this.socketService.socket.disconnect();
    this.socketService.initSocket();
    if (this.playerService.name) {
    this.playerService.initName();
    }

  }
refresh() {
    this.socketService.getRooms();
}

}
