import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  JsonPipe,
  KeyValuePipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import {Pipe, PipeTransform, Injector} from '@angular/core';
import {SumPipe, TimeAgoPipe, UlidToDatePipe} from './pipes';

@Pipe({
  name: 'table',
  standalone: true,
})
export class TablePipe implements PipeTransform {
  constructor(private injector: Injector) {}

  transform(value: any, path: string): any {
    if (!value || !path) {
      return value;
    }

    const parts = path.split('|').map((part) => part.trim());
    const pathPart = parts[0];
    let result = this.resolvePath(value, pathPart);

    // Process all pipe operations (if any)
    if (parts.length > 1) {
      // Apply each pipe in sequence
      for (let i = 1; i < parts.length; i++) {
        result = this.applyPipe(result, parts[i]);
      }
    }

    return result;
  }

  private resolvePath(value: any, path: string): any {
    const parts = path.split('.');

    const resolve = (current: any, remainingParts: string[]): any => {
      if (current === null || current === undefined || remainingParts.length === 0) return current;

      const [part, ...rest] = remainingParts;
      const match = part.match(/^(.+)\[(\*|\d+)\]$/);

      if (match) {
        const [, prop, index] = match;
        const arr = current[prop];
        if (!Array.isArray(arr)) return null;

        if (index === '*') {
          return arr.map((item) => resolve(item, rest));
        } else {
          const item = arr[Number(index)];
          return resolve(item, rest);
        }
      }

      return resolve(current[part], rest);
    };

    return resolve(value, parts);
  }

  private applyPipe(value: any, pipeString: string): any {
    const [pipeName, ...args] = pipeString.split(':').map((arg) => arg.trim());
    const processedArgs = args.map((arg) => arg.replace(/^"(.*)"$/, '$1'));
    const pipeToken = this.getPipeToken(pipeName);

    if (!pipeToken) {
      return value;
    }

    const pipe = this.injector.get<PipeTransform>(pipeToken);
    try {
      return pipe.transform(value, ...processedArgs);
    } catch (_) {
      return value;
    }
  }

  private getPipeToken(pipeName: string): any {
    const pipes: Record<string, any> = {
      'date': DatePipe,
      'keyvalue': KeyValuePipe,
      'slice': SlicePipe,
      'json': JsonPipe,
      'uppercase': UpperCasePipe,
      'lowercase': LowerCasePipe,
      'titlecase': TitleCasePipe,
      'currency': CurrencyPipe,
      'number': DecimalPipe,
      'percent': PercentPipe,
      'timeago': TimeAgoPipe,
      'ulidToDate': UlidToDatePipe,
      'sum': SumPipe,
    };

    return pipes[pipeName];
  }
}
