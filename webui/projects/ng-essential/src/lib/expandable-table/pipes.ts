import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'timeago',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (value) {
      const now = new Date();
      const date = new Date(value);
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      const intervals: Record<string, number> = {
        'y': 31536000,
        'mo': 2592000,
        'w': 604800,
        'd': 86400,
        'h': 3600,
        'm': 60,
        's': 1,
      };
      let counter;
      for (const i in intervals) {
        counter = Math.floor(seconds / intervals[i]);
        if (counter > 0)
          if (counter === 1) {
            return `${counter}${i}`; // singular (1 day ago)
          } else {
            return `${counter}${i}`; // plural (2 days ago)
          }
        // return `${counter}${i}`
      }
    }
    return '';
  }
}

@Pipe({
  name: 'ulidToDate',
  standalone: true,
})
export class UlidToDatePipe implements PipeTransform {
  private readonly BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  transform(ulid: string | null | undefined): Date | null {
    if (!ulid || ulid.length < 10) return null;

    const timeString = ulid.substring(0, 10);
    let timestamp = 0;

    for (const char of timeString) {
      const value = this.BASE32_ALPHABET.indexOf(char);
      if (value === -1) return null; // Invalid character
      timestamp = timestamp * 32 + value;
    }

    return new Date(timestamp);
  }
}

@Pipe({name: 'sum', standalone: true})
export class SumPipe implements PipeTransform {
  transform(value: any[]): number {
    return Array.isArray(value) ? value.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
  }
}
