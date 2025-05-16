export class FormField<T> {
  value: T | undefined;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  type: string;
  options: {key: string; value: string}[];
  placeholder: string;
  default: T | undefined;

  constructor(
    options: {
      value?: T;
      key?: string;
      label?: string;
      required?: boolean;
      order?: number;
      controlType?: string;
      type?: string;
      options?: {key: string; value: string}[];
      placeholder?: string;
      default?: T;
    } = {},
  ) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.type = options.type || '';
    this.options = options.options || [];
    this.placeholder = options.placeholder || '';
    this.default = options.default;
  }
}

export class Dropdown extends FormField<string> {
  override controlType = 'dropdown';
}

export class TextInput extends FormField<string> {
  override controlType = 'input';
}

export class Textarea extends FormField<string> {
  override controlType = 'textarea';
}
