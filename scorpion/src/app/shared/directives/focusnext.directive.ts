import { Directive, ElementRef, HostListener, Input, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appFocusNext]',
  exportAs: 'appFocusNext'
})
export class FocusNextDirective {

  // constructor(private el: ElementRef) {}

  // @HostListener('keydown', ['$event'])
  // handleKeydown(event: KeyboardEvent) {
  //   // Only handle Tab or Enter
  //   if (event.key !== 'Tab' && event.key !== 'Enter') return;
  //   event.preventDefault();

  //   // Get all focusable elements inside this container
  //   const focusable = Array.from(
  //     this.el.nativeElement.querySelectorAll(
  //       'input:not([readonly]):not([disabled]):not([hidden]), ' +
  //       'select:not([disabled]):not([hidden]), ' +
  //       'textarea:not([readonly]):not([disabled]):not([hidden]), ' +
  //       'ng-select:not([disabled]):not([hidden])'
  //     )
  //   ) as (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLElement)[];

  //   // Skip hidden elements (display:none)
  //   const visibleFocusable = focusable.filter(el => el.offsetParent !== null);

  //   let current = event.target as HTMLElement;

  //   // If ng-select, focus its internal input
  //   if (current.tagName.toLowerCase() === 'ng-select') {
  //     const innerInput = current.querySelector('input');
  //     if (innerInput) current = innerInput as HTMLElement;
  //   }

  //   const index = visibleFocusable.indexOf(current);
  //   if (index === -1) return;

  //   // Focus next visible focusable element
  //   for (let i = index + 1; i < visibleFocusable.length; i++) {
  //     const next = visibleFocusable[i] as HTMLElement;

  //     if (next.hasAttribute('readonly') || next.hasAttribute('disabled')) continue;

  //     if (next.tagName.toLowerCase() === 'ng-select') {
  //       const innerInput = next.querySelector('input');
  //       if (innerInput) {
  //         (innerInput as HTMLElement).focus();
  //         break;
  //       }
  //     } else {
  //       next.focus();
  //       break;
  //     }
  //   }

  //   // Optional: wrap around to first element if at the end
  //   // if (index === visibleFocusable.length - 1) {
  //   //   const first = visibleFocusable[0] as HTMLElement;
  //   //   first.focus();
  //   // }
  // }
   constructor(private el: ElementRef) {}

  // Keyboard navigation (Enter/Tab)
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    // Only handle Enter / Tab
    if (event.key !== 'Tab' && event.key !== 'Enter') return;

    const tag = this.el.nativeElement.tagName.toLowerCase();

    // ⚡ Special case: Enter inside ng-select → prevent open/close and go next
    if (event.key === 'Enter' && tag === 'ng-select') {
      event.preventDefault();
      this.focusNext();
      return;
    }

    // Normal handling for other inputs
    event.preventDefault();
    this.focusNext();
  }

  // ng-select mouse selection (auto trigger after change)
  @HostListener('change')
  handleChange() {
    if (this.el.nativeElement.tagName.toLowerCase() === 'ng-select') {
      setTimeout(() => this.focusNext(), 0); // wait till value applied
    }
  }

  private focusNext() {
    const form = this.el.nativeElement.closest('form');
    if (!form) return;

    const focusable = Array.from(
      form.querySelectorAll(
        'input:not([readonly]):not([disabled]):not([hidden]), ' +
        'select:not([disabled]):not([hidden]), ' +
        'textarea:not([readonly]):not([disabled]):not([hidden]), ' +
        'ng-select:not([disabled]):not([hidden])'
      )
    ) as HTMLElement[];

    const visibleFocusable = focusable.filter(el => el.offsetParent !== null);

    let current: HTMLElement = this.el.nativeElement;
    if (current.tagName.toLowerCase() === 'ng-select') {
      const innerInput = current.querySelector('input');
      if (innerInput) current = innerInput as HTMLElement;
    }

    const index = visibleFocusable.indexOf(current);
    if (index === -1) return;

    for (let i = index + 1; i < visibleFocusable.length; i++) {
      const next = visibleFocusable[i];
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
  }


}
