import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Component, inject} from '@angular/core';
import {rxResource} from '@angular/core/rxjs-interop';
import {Review} from '@app/interfaces';
import {environment} from '@env';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ExpandableTableComponent, EditorComponent} from 'ng-essential';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {RouterModule} from '@angular/router';

interface ReviewsResponse {
  total_rows: number;
  offset: number;
  rows: Row[];
}

interface Row {
  id: string;
  key: string;
  value: {rev: string};
  doc: Review;
}

@Component({
  selector: 'e-list-reviews',
  imports: [
    ExpandableTableComponent,
    MatIconModule,
    EditorComponent,
    MatProgressSpinnerModule,
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    RouterModule,
  ],
  templateUrl: './list-reviews.html',
  styles: ``,
})
export class ListReviews {
  private http = inject(HttpClient);

  private opts = {
    headers: {
      'authorization': ``, // skip token on couchdb readonly endpoints
    },
  };

  reviewsResponse = rxResource({
    // stream: () => // v20
    loader: () =>
      this.http.get<ReviewsResponse>(
        `${environment.couchdb}/${environment.chaincode.channelId}_${environment.chaincode.name}/_all_docs?include_docs=true`,
        this.opts,
      ),
  });

  columns = ['website', 'title', 'rating', 'summary', 'positives', 'negatives', 'age', 'votes'];
  cellDefs = [
    'doc.website',
    'doc.title | slice:0:48',
    'doc.rating',
    'doc.summary | slice:0:96',
    'doc.positives',
    'doc.negatives',
    'doc.id | ulidToDate | timeago',
    'doc.votes[*].value | sum',
  ];

  currentExpandedRow?: Row;
  shouldShowDetails = false;

  handleRowChange(rowData: Row) {
    this.currentExpandedRow = rowData;
  }

  toggleDetails() {
    this.shouldShowDetails = !this.shouldShowDetails;
  }

  viewMode = 'table'; // table | grid
  onViewModeChange(mode: string) {
    this.viewMode = mode;
  }
}
