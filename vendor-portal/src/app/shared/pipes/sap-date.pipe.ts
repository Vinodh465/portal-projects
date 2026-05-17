import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sapDate',
  standalone: true
})
export class SapDatePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '—';
    
    // Handle SAP OData Date format: /Date(1234567890000)/
    if (typeof value === 'string' && value.includes('/Date(')) {
      const timestamp = parseInt(value.match(/\d+/)?.[0] || '0', 10);
      if (timestamp) {
        return new Date(timestamp).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
    }
    
    // Handle standard Date objects or strings
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    
    return value;
  }
}
