import {Component, inject, input, output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {FormField} from './form-field';
import {FormControlService} from './form-control';
import {CommonModule} from '@angular/common';
import {DynamicFormField} from './dynamic-form-field/dynamic-form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldAppearance} from '@angular/material/form-field';

@Component({
  selector: 'e-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicFormField, MatButtonModule],
  template: `
    <form (ngSubmit)="onSubmit()" [formGroup]="form" class="max-w-xl py-2">
      @for (field of formFields(); track field) {
      <div class="form-row">
        <e-dynamic-form-field [formField]="field" [form]="form" [appearance]="appearance()"></e-dynamic-form-field>
      </div>
      }

      <div class="flex justify-end gap-2">
        <button mat-button color="accent" type="button" (click)="onCancel()">CANCEL</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!form.valid">CONFIRM</button>
      </div>
    </form>
  `,
  styles: ``,
})
export class DynamicForm {
  private fcs = inject(FormControlService);

  formFields = input<FormField<string>[]>([]);
  appearance = input<MatFormFieldAppearance>('fill');
  formSubmit = output<any>();
  formCancel = output<void>();

  form!: FormGroup;

  ngOnInit() {
    this.form = this.fcs.toFormGroup(this.formFields() as FormField<string>[]);
  }

  onSubmit() {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value);
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
