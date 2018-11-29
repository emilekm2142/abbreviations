import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PageComponent} from './front-page/page/page.component';
import {GamePageComponent} from './game/game-page/game-page.component';

const routes: Routes = [
  {path: '', component: PageComponent },
  {path: 'room/:room', component: GamePageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
