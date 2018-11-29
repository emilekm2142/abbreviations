import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GamesListingComponent} from './games-listing/games-listing.component';
import {PageComponent} from './page/page.component';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatIconModule,
  MatListModule,
  MatPaginatorModule,
  MatRippleModule,
  MatSlideToggleModule
} from '@angular/material';
import {MatInputModule} from '@angular/material/input';
import {NamePromptComponent} from './name-prompt/name-prompt.component';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {GameCreatorComponent} from './game-creator/game-creator.component';
import {RouterModule} from '@angular/router';
import {RoomFilterPipe} from './room-filter.pipe';

@NgModule({
  declarations: [GamesListingComponent, PageComponent, NamePromptComponent, GameCreatorComponent, RoomFilterPipe],
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
    MatPaginatorModule,
  ],
  exports:[PageComponent, NamePromptComponent]
})
export class FrontPageModule { }
