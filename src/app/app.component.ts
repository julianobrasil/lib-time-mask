import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

import * as moment_ from 'moment';
const moment = moment_;
export type Moment = moment_.Moment;

@Component({
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  inputCtrl: FormControl = new FormControl(moment([2018, 2, 3, 3, 4, 1, 1]));
  inputCtrl2: FormControl = new FormControl();
  title = 'demo';
  test = moment([2018, 2, 3, 3, 40, 1, 1]);
}
