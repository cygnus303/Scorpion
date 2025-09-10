// import { Directive, HostListener, ElementRef } from '@angular/core';

// @Directive({
//   selector: '[appTabNavigation]'
// })
// export class TabNavigationDirective {

//   constructor(private el: ElementRef) {}

//   @HostListener('keydown', ['$event'])
//   handleTab(event: KeyboardEvent) {
//     if (event.key === 'Tab') {
//       event.preventDefault();

//       const form = this.el.nativeElement.closest('form') || document;
//       const focusable = Array.from(
//         form.querySelectorAll(
//           'input, select, textarea, button, [tabindex]:not([tabindex="-1"]), ng-select'
//         )
//       ).filter((el: any) => 
//         !el.disabled && 
//         el.offsetParent !== null &&
//         !(el.hasAttribute('readonly')) // skip readonly fields
//       );

//       const index = focusable.indexOf(event.target as HTMLElement);
//       if (index === -1) return;

//       let nextIndex: number;
//       if (!event.shiftKey) {
//         nextIndex = (index + 1) % focusable.length;
//       } else {
//         nextIndex = (index - 1 + focusable.length) % focusable.length;
//       }

//       const nextEl = focusable[nextIndex] as HTMLElement;

//       // Special handling for ng-select
//       if (nextEl.tagName.toLowerCase() === 'ng-select') {
//         nextEl.focus();
//         const input = nextEl.querySelector('input');
//         if (input) input.focus();
//       } else {
//         nextEl.focus();
//       }
//     }
//   }
// }

import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appTabNavigation]'
})
export class TabNavigationDirective {

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  handleTab(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const target = event.target as HTMLElement;

    // 🚀 Allow default for <select> & <ng-select>
    if (target.tagName.toLowerCase() === 'select' || target.tagName.toLowerCase() === 'ng-select') {
      return;
    }

    event.preventDefault();

    const form = this.el.nativeElement.closest('form') || document;

    // ✅ Collect focusable elements
    const focusable = Array.from(
      form.querySelectorAll(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"]), ng-select'
      )
    ).filter((el: any) => {
      const isDisabled = el.hasAttribute('disabled') || el.disabled === true;
      const isHidden = el.offsetParent === null;
      const isReadOnly = el.hasAttribute('readonly') || el.readOnly === true;
      return !isDisabled && !isHidden && !isReadOnly;
    });

    const index = focusable.indexOf(target);
    if (index === -1) return;

    let nextIndex: number;
    if (!event.shiftKey) {
      nextIndex = (index + 1) % focusable.length;
    } else {
      nextIndex = (index - 1 + focusable.length) % focusable.length;
    }

    let nextEl = focusable[nextIndex] as HTMLElement;

    // 🚫 Skip disabled / readonly safety check again before focus
    let loopCount = 0;
    while (
      nextEl &&
      (nextEl.hasAttribute('disabled') ||
        (nextEl as HTMLInputElement).disabled ||
        nextEl.hasAttribute('readonly') ||
        (nextEl as HTMLInputElement).readOnly)
    ) {
      loopCount++;
      if (loopCount > focusable.length) return; // prevent infinite loop
      nextIndex = !event.shiftKey
        ? (nextIndex + 1) % focusable.length
        : (nextIndex - 1 + focusable.length) % focusable.length;
      nextEl = focusable[nextIndex] as HTMLElement;
    }

    // ✅ Apply focus only if safe
    if (nextEl) {
      if (nextEl.tagName.toLowerCase() === 'ng-select') {
        nextEl.focus();
        const input = nextEl.querySelector('input');
        if (input) input.focus();
      } else {
        nextEl.focus();
      }
    }
  }
}
