import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDecimalLimit]',
  standalone: false
})
export class DecimalLimitDirective {

  @Input() unit: 'INCHES' | 'CM' | undefined; // default fallback handle in code

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    // unit fallback
    const unit = (this.unit || 'INCHES').toUpperCase();

    // regex unit wise
    const regex =
      unit === 'INCHES'
        ? /^\d{0,2}(\.\d{0,2})?$/      // max 99.99
        : /^\d{0,3}(\.\d{0,2})?$/;     // max 999.99

    if (!regex.test(input.value)) {
      input.value = input.value.slice(0, -1);
    }

    // hard limit check
    const value = parseFloat(input.value);
    if (unit === 'INCHES' && value > 99.99) {
      input.value = '99.99';
    }
    if (unit === 'CM' && value > 999.99) {
      input.value = '999.99';
    }
  }
}
