import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamePageComponent } from './game-page/game-page.component';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule, MatChipsModule,
  MatFormFieldModule, MatIconModule,
  MatInputModule,
  MatListModule, MatRippleModule,
  MatSlideToggleModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import { PlayersListComponent } from './players-list/players-list.component';
import {FrontPageModule} from '../front-page/front-page.module';

@NgModule({
  declarations: [GamePageComponent, PlayersListComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
    MatBadgeModule,
    FrontPageModule,
    MatChipsModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule,
    MatRippleModule,
    RouterModule,
  ],
})
export class GameModule { }
