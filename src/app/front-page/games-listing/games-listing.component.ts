import {Component, Input, OnInit} from '@angular/core';
import {Room} from '../../models/Room';
import {SocketService} from '../../socket.service';

@Component({
  selector: 'app-games-listing',
  templateUrl: './games-listing.component.html',
  styleUrls: ['./games-listing.component.scss']
})
export class GamesListingComponent implements OnInit {
  @Input() games:Room[];
  @Input() clickable=true;
  constructor(private socketS:SocketService) { }
  ngOnInit() {
  }
  get rooms(){
    return this.socketS.rooms;
  }

}
