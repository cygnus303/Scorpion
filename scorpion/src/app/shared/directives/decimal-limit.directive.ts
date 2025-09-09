import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDecimalLimit]',
  standalone: false
})
export class DecimalLimitDirective {

  @Input() unit: 'INCHES' | 'CM' | undefined;

  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    const unit = (this.unit || 'INCHES').toUpperCase();

    // regex unit wise
    const regex =
      unit === 'INCHES'
        ? /^\d{0,2}(\.\d{0,2})?$/      // max 99.99
        : /^\d{0,3}(\.\d{0,2})?$/;     // max 999.99

    let value = input.value;

    // remove invalid char
    if (!regex.test(value)) {
      value = value.slice(0, -1);
    }

    // hard limit check
    const numValue = parseFloat(value);
    if (unit === 'INCHES' && numValue > 99.99) {
      value = '99.99';
    }
    if (unit === 'CM' && numValue > 999.99) {
      value = '999.99';
    }

    // 👇 Update both UI & FormControl properly
    input.value = value;
    this.ngControl.control?.setValue(Number(value), { emitEvent: false }); // prevent double event loop
  }
}
