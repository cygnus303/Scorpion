import { Directive, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFocusNext]'
})
export class FocusNextDirective {

  constructor(private renderer: Renderer2) {}

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    const current = event.target as HTMLElement;
    if (!current) return;

    // Allow Enter in textarea for new line
    if (current.tagName.toLowerCase() === 'textarea' && event.key === 'Enter') return;

    const isEnter = event.key === 'Enter';
    const isTab = event.key === 'Tab';
    if (!isEnter && !isTab) return;

    const form = current.closest('form');
    if (!form) return;

    // Get all inputs, selects, textareas, buttons, ng-select
    const allInputs = Array.from(form.querySelectorAll<HTMLElement>('input, select, textarea, button, ng-select'));

    // Filter editable (force) inputs
    const focusable = allInputs.filter(el => {
      const tag = el.tagName.toLowerCase();

      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return !(el as HTMLInputElement).disabled || !(el as HTMLInputElement).readOnly;
      }

      if (tag === 'ng-select') {
        const input = el.querySelector('input') as HTMLInputElement;
        return !!input && !input.readOnly && !input.disabled;
      }

      return true; // buttons etc.
    });

    // Remove focus-border from current only if it's editable
    if (current.tagName.toLowerCase() === 'ng-select' || current.closest('ng-select')) {
      const ngHost = current.closest('ng-select') as HTMLElement;
      const container = ngHost?.querySelector('.ng-select-container') as HTMLElement;
      if (container) this.renderer.removeClass(container, 'focus-border');
    } else {
      const inputEl = current as HTMLInputElement;
      if (!inputEl.readOnly && !inputEl.disabled) {
        this.renderer.removeClass(current, 'focus-border');
      }
    }

    if (isEnter) {
      event.preventDefault();

      // Determine current index
      let index = focusable.indexOf(current);
      const ngSelectWrapper = current.closest('ng-select') as HTMLElement;
      if (ngSelectWrapper) index = focusable.indexOf(ngSelectWrapper);

      // Focus next editable input
      if (index > -1 && index < focusable.length - 1) {
        const next = focusable[index + 1];

        if (next.tagName.toLowerCase() === 'ng-select') {
          const input = next.querySelector('input');
          input?.focus();
          const container = next.querySelector('.ng-select-container') as HTMLElement;
          if (container) this.renderer.addClass(container, 'focus-border');
        } else {
          (next as HTMLElement).focus();
          this.renderer.addClass(next, 'focus-border');
        }
      }
    } else {
      // If Tab pressed, just highlight current editable
      if (current.tagName.toLowerCase() === 'ng-select' || current.closest('ng-select')) {
        const ngHost = current.closest('ng-select') as HTMLElement;
        const container = ngHost?.querySelector('.ng-select-container') as HTMLElement;
        if (container) this.renderer.addClass(container, 'focus-border');
      } else {
        const inputEl = current as HTMLInputElement;
        if (!inputEl.readOnly && !inputEl.disabled) {
          this.renderer.addClass(current, 'focus-border');
        }
      }
    }
  }
}
