import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {PlayerService} from '../../player.service';

@Component({
  selector: 'app-name-prompt',
  templateUrl: './name-prompt.component.html',
  styleUrls: ['./name-prompt.component.scss'],
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
  constructor(private pService:PlayerService ){ }

  ngOnInit() {
  }
  onInput() {
  }
  applyName(){
    if (this.nameInput.length>=this.minLen){
      this.pService.changeName(this.nameInput);
      this.nameChangedEvent.emit();
    }
  }

}
