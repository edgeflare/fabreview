import {Component, input, Input} from '@angular/core';
import {FormField} from '../form-field';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldAppearance, MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'e-dynamic-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule, MatInputModule, MatFormFieldModule],
  templateUrl: './dynamic-form-field.html',
  styles: ``,
})
export class DynamicFormField {
  formField = input.required<FormField<any>>();
  form = input.required<FormGroup>();
  appearance = input<MatFormFieldAppearance>('fill');

  get isValid() {
    return this.form().controls[this.formField().key].valid;
  }
}
