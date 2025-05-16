import {Component} from '@angular/core';
import {Dropdown, FormField, TextInput} from '.';
import {Observable, of} from 'rxjs';
import {DynamicForm} from '.';
import {AsyncPipe} from '@angular/common';
import {Textarea} from './form-field';

@Component({
  selector: 'e-example-dynamic-form',
  standalone: true,
  imports: [AsyncPipe, DynamicForm],
  template: `
    <e-dynamic-form [formFields]="(formField$ | async) || []" method="" action=""></e-dynamic-form>
  `,
  styles: ``,
})
export class ExampleDynamicForm {
  formField$: Observable<FormField<any>[]>;

  constructor() {
    this.formField$ = this.getQuestions();
  }

  getQuestions() {
    const formFields: FormField<string>[] = [
      new TextInput({
        key: 'name',
        label: 'descriptive name',
        value: '',
        required: true,
        order: 1,
      }),

      new Textarea({
        key: 'pubkey',
        label: 'SSH Public Key',
        order: 2,
      }),

      new Dropdown({
        key: 'brave',
        label: 'Bravery Rating',
        options: [
          {key: 'solid', value: 'Solid'},
          {key: 'great', value: 'Great'},
          {key: 'good', value: 'Good'},
          {key: 'unproven', value: 'Unproven'},
        ],
        order: 3,
      }),

      new TextInput({
        key: 'firstName',
        label: 'First name',
        value: 'Bombasto',
        required: true,
        order: 4,
      }),

      new Textarea({
        key: 'emailAddress',
        label: 'Email',
        type: 'email',
        order: 5,
      }),
    ];

    return of(formFields.sort((a, b) => a.order - b.order));
  }
}
