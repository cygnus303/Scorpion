import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFocusNext]'
})
export class FocusNextDirective {

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    // Only handle Tab or Enter
    if (event.key !== 'Tab' && event.key !== 'Enter') return;
    event.preventDefault();

    // Get all focusable elements inside this container
    const focusable = Array.from(
      this.el.nativeElement.querySelectorAll(
        'input:not([readonly]):not([disabled]):not([hidden]), ' +
        'select:not([disabled]):not([hidden]), ' +
        'textarea:not([readonly]):not([disabled]):not([hidden]), ' +
        'ng-select:not([disabled]):not([hidden])'
      )
    ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLElement)[];

    // Skip hidden elements (display:none)
    const visibleFocusable = focusable.filter(el => el.offsetParent !== null);

    let current = event.target as HTMLElement;

    // If ng-select, focus its internal input
    if (current.tagName.toLowerCase() === 'ng-select') {
      const innerInput = current.querySelector('input');
      if (innerInput) current = innerInput as HTMLElement;
    }

    const index = visibleFocusable.indexOf(current);
    if (index === -1) return;

    // Focus next visible focusable element
    for (let i = index + 1; i < visibleFocusable.length; i++) {
      const next = visibleFocusable[i] as HTMLElement;

      if (next.hasAttribute('readonly') || next.hasAttribute('disabled')) continue;

      if (next.tagName.toLowerCase() === 'ng-select') {
        const innerInput = next.querySelector('input');
        if (innerInput) {
          (innerInput as HTMLElement).focus();
          break;
        }
      } else {
        next.focus();
        break;
      }
    }

    // Optional: wrap around to first element if at the end
    // if (index === visibleFocusable.length - 1) {
    //   const first = visibleFocusable[0] as HTMLElement;
    //   first.focus();
    // }
  }
}
