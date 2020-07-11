import {Component, Input, OnInit} from '@angular/core';
import {Room} from '../../models/Room';
import {SocketService} from '../../socket.service';

@Component({
  selector: 'app-games-listing',
  templateUrl: './games-listing.component.html',
  styleUrls: ['./games-listing.component.css']
})
export class GamesListingComponent implements OnInit {
  @Input() games:Room[];
  @Input() clickable=true;
  @Input() filter: string;
  @Input() start: number = 0;
  @Input() end: number = 10000;
  constructor(private socketS:SocketService) { }
  ngOnInit() {
  }
  get rooms(){
    return this.socketS.rooms;
  }

}
