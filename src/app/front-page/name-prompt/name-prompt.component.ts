import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {PlayerService} from '../../player.service';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-name-prompt',
  templateUrl: './name-prompt.component.html',
  styleUrls: ['./name-prompt.component.css'],
  animations: [
    trigger(
      'btnAnimation', [
        transition(':enter', [
          style({  opacity:0}),
          animate('500ms', style({ opacity:1}))
        ]),
        transition(':leave', [
          style({opacity: 1}),
          animate('500ms', style({opacity: 0}))
        ])
      ]
    )
  ]
})
export class NamePromptComponent implements OnInit {
  nameInput = '';
  minLen = 2;
  @Output() nameChangedEvent:EventEmitter<boolean> = new EventEmitter()
  constructor(private pService:PlayerService,private route: ActivatedRoute){ }

  ngOnInit() {
  }
  onInput() {
  }
  applyName(){
    if (this.nameInput.length>=this.minLen){
      this.pService.changeName(this.nameInput);
      this.nameChangedEvent.emit();
      const id = this.route.snapshot.paramMap.get('room');
      if(id){
        window.location.reload();
      }
    }
  }

}
