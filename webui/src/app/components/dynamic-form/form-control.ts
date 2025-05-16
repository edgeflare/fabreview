import {Injectable} from '@angular/core';
import {FormField} from './form-field';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormControlService {
  toFormGroup(formFields: FormField<string>[]) {
    const group: any = {}; // @typescript-eslint/no-explicit-any

    formFields.forEach((formField) => {
      // Use default value if provided and no explicit value is set
      const initialValue =
        formField.value !== undefined
          ? formField.value
          : formField.default !== undefined
            ? formField.default
            : '';

      group[formField.key] = formField.required
        ? new FormControl(initialValue, Validators.required)
        : new FormControl(initialValue);
    });

    return new FormGroup(group);
  }
}
