import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ListReviews} from '../list-reviews/list-reviews';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'e-home',
  imports: [ListReviews, MatCardModule],
  templateUrl: './home.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
