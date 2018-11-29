import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesListingComponent } from './games-listing/games-listing.component';
import { PageComponent } from './page/page.component';
import {MatCard, MatCardModule, MatFormFieldModule, MatList} from '@angular/material';
import {MatInputModule} from '@angular/material/input';
import { NamePromptComponent } from './name-prompt/name-prompt.component';
import {MatButtonModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameCreatorComponent } from './game-creator/game-creator.component';
import {MatListModule} from '@angular/material';
import {MatCheckboxModule} from '@angular/material';
import {MatSlideToggleModule} from '@angular/material';
import {MatIconModule} from '@angular/material';
import {MatRippleModule} from '@angular/material';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [GamesListingComponent, PageComponent, NamePromptComponent, GameCreatorComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FormsModule,
    MatFormFieldModule,
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
  exports:[PageComponent, NamePromptComponent]
})
export class FrontPageModule { }
