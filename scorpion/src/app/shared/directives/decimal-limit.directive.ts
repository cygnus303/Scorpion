import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDecimalLimit]',
  standalone: false
})
export class DecimalLimitDirective {

  @Input() unit: 'INCHES' | 'CM' | undefined;

   constructor(private control: NgControl) {}
  @HostListener('input', ['$event'])
  onInput(event: Event) {
      const input = event.target as HTMLInputElement;
      let value = input.value;

      // unit pramane integer digits ni limit
      const intLimit = this.unit === 'INCHES' ? 2 : 3;

      const regex = new RegExp(`^\\d{0,${intLimit}}(\\.\\d{0,2})?$`);

      if (!regex.test(value)) {
        const match = value.match(new RegExp(`^(\\d{0,${intLimit}})(\\.\\d{0,2})?`));
        if (match) {
          value = (match[1] || '') + (match[2] || '');
        } else {
          value = '';
        }
        input.value = value;
        this.control?.control?.setValue(value);
      }
    }
}
