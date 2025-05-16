import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Component, inject, Input, OnInit} from '@angular/core';
import {Dropdown, DynamicForm, FormField, Textarea, TextInput} from '@app/components/dynamic-form';
import {AuthService} from '@edgeflare/ng-oidc';
import {environment} from '@env';
import {countries} from './countries';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Review} from '@app/interfaces';
import {CommonModule} from '@angular/common';
import {ulid} from 'ulid';

interface ReviewForm extends Review {
  positivesStr: string;
  negativesStr: string;
  extraInfoStr: string;
}

@Component({
  selector: 'e-edit-review',
  imports: [DynamicForm, CommonModule],
  template: `
  {{ id }}
  <div class="center-child">
    <e-dynamic-form class="w-128" style="max-width: 100vw;"
      [formFields]="formFields"
      (formSubmit)="handleSubmit($event)"
      (formCancel)="handleCancel()"
      [appearance]="'fill'"
    />
  </div>
  `,
  styles: ``,
})
export class EditReview {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  action = `${environment.fabricProxy}/default/assetcc/submit-transaction`;

  @Input('id') id!: string;

  headers: HttpHeaders = new HttpHeaders({});

  formFields: FormField<string>[] = [
    new TextInput({
      key: 'website',
      label: 'organisation website',
      required: true,
      order: 1,
    }),

    new TextInput({
      key: 'title',
      label: 'review title',
      required: true,
      order: 2,
    }),

    new Textarea({
      key: 'summary',
      label: 'summary',
      required: true,
      order: 2,
    }),

    new Dropdown({
      key: 'rating',
      label: 'rating',
      required: true,
      order: 3,
      options: Array.from({length: 10}, (_, i) => {
        const value = String(i + 1);
        return {key: value, value};
      }),
    }),

    new Textarea({
      key: 'positivesStr',
      label: 'positives - one per line',
      required: true,
      order: 4,
    }),

    new Textarea({
      key: 'negativesStr',
      label: 'negatives - one per line',
      required: true,
      order: 5,
    }),

    new Dropdown({
      key: 'country',
      label: 'company_country',
      required: true,
      order: 6,
      options: countries,
      default: 'BD',
    }),

    new TextInput({
      key: 'state',
      label: 'division / province / state',
      required: true,
      order: 7,
      default: 'Dhaka',
    }),

    new TextInput({
      key: 'locality',
      label: 'town / city / locality',
      required: true,
      order: 8,
    }),

    new TextInput({
      key: 'email',
      label: 'company_public_email',
      required: false,
      order: 9,
    }),

    new TextInput({
      key: 'phone',
      label: 'company_public_phone',
      required: false,
      order: 10,
    }),

    new Textarea({
      key: 'extraInfoStr',
      label: 'extra_info in JSON',
      required: false,
      order: 11,
    }),
  ];

  handleSubmit(formData: ReviewForm) {
    if (this.authService.isAuthenticated() && this.authService.user()?.profile.sub) {
      if (this.id && this.id !== '') {
        // fetch the doc and populate the form fields for edit
        formData.id = this.id;
        // do update
      } else {
        // create review
        formData.user_id = this.authService.user()?.profile.sub || '';
        const newReviewId = `${ulid()}`;
        formData.id = newReviewId;

        // parse positives and negatives into string[]
        formData.positives = formData.positivesStr
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => !!line);

        formData.negatives = formData.negativesStr
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => !!line);

        // parse extra_info JSON
        try {
          formData.extra_info = formData.extraInfoStr ? JSON.parse(formData.extraInfoStr) : {};
        } catch (err) {
          this.snackBar.open('Invalid JSON in extra_info', 'Close', {duration: 3000});
          return;
        }

        console.log(formData);

        this.createReview(formData);
        // this.snackBar.open('Review submitted successfully', 'X', { duration: 2000 });
      }
    }
  }

  createReview(review: Review) {
    const func = 'CreateReview';
    const args = [
      review.id,
      review.title,
      review.website,
      review.summary,
      review.country,
      review.state,
      review.locality,
      review.email,
      review.phone,
      `${JSON.stringify(review.positives)}`,
      `${JSON.stringify(review.negatives)}`,
      `${JSON.stringify(review.extra_info)}`,
      `${review.rating}`,
    ];

    console.log(args);

    this.http
      .post(
        `${environment.fabricProxy}/${environment.chaincode.channelId}/${environment.chaincode.name}/submit-transaction`,
        {
          func,
          args,
        },
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.snackBar.open(`submitted. got response: ${JSON.stringify(res) || 'ok'}`, 'X', {
            duration: 2000,
          });
        },
        error: (err) => {
          console.error('Error creating key:', err);
          this.snackBar.open(JSON.stringify(err), 'X', {duration: 2000});
        },
      });
  }

  editReview(review: Review): void {
    // For now, just show the review in the snackbar
    this.snackBar.open('Review processed: ' + review.id, 'X', {duration: 2000});
    console.log('Review to submit:', review);
  }

  protected handleCancel(): void {
    console.log('cancelled');
  }
}
