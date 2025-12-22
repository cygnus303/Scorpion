import { Directive, ElementRef, Host, HostListener,NgZone, Optional} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import Swal from 'sweetalert2';
import { DocketService } from '../services/docket.service';

@Directive({
  selector: '[appFocusNext]',
  exportAs: 'appFocusNext'
})
export class FocusNextDirective {
  private hasConfirmedNoEwayBill = false;

  constructor(
    private el: ElementRef<HTMLElement>,
    private ngZone: NgZone,
    private docketService:DocketService,
    @Optional() @Host() private ngSelect?: NgSelectComponent
  ) {}



  ngAfterViewInit() {
  const isEwayBill =
    this.el.nativeElement.getAttribute('formControlName') === 'ewayBillNo';

  if (isEwayBill) {
    setTimeout(() => {
      (this.el.nativeElement as HTMLElement).focus();
    }, 0);
  }
}

  // 🔑 Keydown handler
  @HostListener('keydown', ['$event'])
async handleKeydown(event: KeyboardEvent) {
    if (this.docketService.hasConfirmedNoEwayBill) {
    return;
  }
    const tag = this.el.nativeElement.tagName.toLowerCase();
     const isEwayBill =
      this.el.nativeElement.getAttribute('formControlName') === 'ewayBillNo';

    if (event.key !== 'Enter' && event.key !== 'Tab') return;

    if (isEwayBill) {
      const input = this.el.nativeElement as HTMLInputElement;

      if (!input.value || input.value.length < 12) {
        event.preventDefault(); // ❌ stop normal tab/enter

        let goNext = false;
        let confirmedYes = false;

        await Swal.fire({
          title: 'Are you sure you do not have EWayBill No. to Add?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#2c3e50',
          width: '420px',
          buttonsStyling: false,
          customClass: {
            popup: 'glassy-info-popup',
            title: 'glassy-info-title',
            htmlContainer: 'glassy-info-body',
            confirmButton: 'glassy-info-btn',
            cancelButton: 'glassy-info-btn',
            icon: 'glassy-info-icon',
            actions: 'glassy-info-actions'  // custom class for buttons container
          },
          didClose: () => {
            // 🔑 focus control after dialog closed
            if (goNext) {
              const form = input.closest('form');
            if (!form) return;

            const selector =
              'input:not([readonly]):not([disabled]):not([hidden]), ' +
              'select:not([disabled]):not([hidden]), ' +
              'textarea:not([readonly]):not([disabled]):not([hidden]), ' +
              'ng-select:not([disabled]):not([hidden])';

            const all = Array.from(form.querySelectorAll(selector)) as HTMLElement[];
            const visible = all.filter(el => this.isVisible(el));

            const index = visible.indexOf(input);
            if (index !== -1 && index + 1 < visible.length) {
              setTimeout(() => visible[index + 1].focus(), 0);
            }          
            } else {
              setTimeout(() => input.focus(), 0);
            }
          }
        }).then(result => {
          // goNext = result.isConfirmed;
           if (result.isConfirmed) {
          goNext = result.isConfirmed;

      confirmedYes = true;
      this.docketService.hasConfirmedNoEwayBill = true;
    }
        });

        return;
      }
      if (input.value.length !== 12) {
        input.value= '';
        event.preventDefault();
      }
    }

    if (event.key !== 'Enter' && event.key !== 'Tab') return;

    event.preventDefault();

    // Special case: Enter inside ng-select → forward only
    if (event.key === 'Enter' && tag === 'ng-select') {
      this.moveFocus(true);
      return;
    }

    // Tab / Shift+Tab
    if (event.key === 'Tab') {
      const forward = !event.shiftKey;
      if (forward) {
        this.moveFocus(true);      // Tab → forward
      } else {
        this.moveprevent(false);   // Shift+Tab → backward
      }
    }

    // Optional: Enter outside ng-select → forward
    if (event.key === 'Enter' && tag !== 'ng-select') {
      this.moveFocus(true);
    }
  }
@HostListener('document:click', ['$event'])
async handleOutsideClick(event: MouseEvent) {

  // 🔒 Global stop after YES
  if (this.docketService.hasConfirmedNoEwayBill || this.docketService.isComplition) {
    return;
  }

  // 🚫 Ignore clicks while popup open
  if (Swal.isVisible()) {
    return;
  }

  const target = event.target as HTMLElement;
  if (!target) return;

  // Click on ewaybill → ignore
  if (target.getAttribute('formControlName') === 'ewayBillNo') {
    return;
  }

  const ewayValue =
    this.docketService.basicDetailForm.get('ewayBillNo')?.value;

  // Valid → do nothing
  if (ewayValue && ewayValue.length === 12) {
    return;
  }

  let confirmedYes = false;

await Swal.fire({
  title: 'Are you sure you do not have EWayBill No. to Add?',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Yes',
  cancelButtonText: 'No',
  allowOutsideClick: false,
  allowEscapeKey: false,
  width: '420px',
  background: 'rgba(255, 255, 255, 0.9)',
  color: '#2c3e50',
  buttonsStyling: false,
  customClass: {
    popup: 'glassy-info-popup',
    title: 'glassy-info-title',
    htmlContainer: 'glassy-info-body',
    confirmButton: 'glassy-info-btn',
    cancelButton: 'glassy-info-btn',
    icon: 'glassy-info-icon',
    actions: 'glassy-info-actions'
  },

    didClose: () => {
      // 🔐 Focus control AFTER popup completely closed
      (document.activeElement as HTMLElement)?.blur();
      
      if (!confirmedYes) {
        const ewayInput = document.querySelector(
          'input[formControlName="ewayBillNo"]'
        ) as HTMLInputElement | null;
        ewayInput?.focus();
      }
    }
  }).then(result => {
    if (result.isConfirmed) {
      confirmedYes = true;
      this.docketService.hasConfirmedNoEwayBill = true;
    }
  });
}
  // 🔑 On focus → open ng-select dropdown
  @HostListener('focus')
  handleFocus() {
    if (this.ngSelect) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => this.ngSelect?.open(), 0);
      });
    }
  }

  // 🔑 On change (select / input change) → move forward
  @HostListener('change')
  handleChange() {
    if (this.ngSelect) {
      setTimeout(() => this.moveFocus(true), 0);
    }
  }

  // 🔑 Forward focus
  private moveFocus(forward: boolean) {
    this.navigate(forward, false);
  }

  // 🔑 Backward focus (Shift+Tab)
  private moveprevent(forward: boolean) {
    this.navigate(forward, true);
  }

  // 🔑 Core navigation
  // private navigate(forward: boolean, normalizeNgSelect: boolean) {
  //   const form = this.el.nativeElement.closest('form');
  //   if (!form) return;

  //   const selector =
  //     'input:not([readonly]):not([disabled]):not([hidden]), ' +
  //     'select:not([disabled]):not([hidden]), ' +
  //     'textarea:not([readonly]):not([disabled]):not([hidden]), ' +
  //     'ng-select:not([disabled]):not([hidden])';

  //   const all = Array.from(form.querySelectorAll(selector)) as HTMLElement[];
  //   const visible = all.filter(el => this.isVisible(el));
  //   if (!visible.length) return;

  //   // Normalize current
  //   let current: HTMLElement = this.el.nativeElement;
  //   if (normalizeNgSelect) {
  //     const ngHost = current.closest('ng-select') as HTMLElement | null;
  //     if (ngHost) current = ngHost;
  //   } else if (current.tagName.toLowerCase() === 'ng-select') {
  //     const inner = current.querySelector('input');
  //     if (inner) current = inner as HTMLElement;
  //   }

  //   let index = visible.indexOf(current);
  //   if (index === -1) return;

  //   if (forward) {
  //     for (let i = index + 1; i < visible.length; i++) {
  //       if (this.tryFocus(visible[i])) break;
  //     }
  //   } else {
  //     for (let i = index - 1; i >= 0; i--) {
  //       if (this.tryFocus(visible[i])) break;
  //     }
  //   }
  // }

  private navigate(forward: boolean, normalizeNgSelect: boolean) {
  const form = this.el.nativeElement.closest('form');
  if (!form) return;

  const selector =
    'input:not([readonly]):not([disabled]):not(.disabled-input), ' +
    'select:not([disabled]):not([readonly]), ' +
    'textarea:not([readonly]):not([disabled]), ' +
    'ng-select:not([disabled]):not([hidden])';

  const all = Array.from(form.querySelectorAll(selector)) as HTMLElement[];
  const visible = all.filter(el => this.isVisible(el));
  if (!visible.length) return;

  let current: HTMLElement = this.el.nativeElement;

  if (normalizeNgSelect) {
    const ngHost = current.closest('ng-select') as HTMLElement | null;
    if (ngHost) current = ngHost;
  } else if (current.tagName.toLowerCase() === 'ng-select') {
    const inner = current.querySelector('input');
    if (inner) current = inner as HTMLElement;
  }

  let index = visible.indexOf(current);
  if (index === -1) return;

  let next = forward ? index + 1 : index - 1;

  // Skip readonly / disabled / hidden
  while (
    next >= 0 &&
    next < visible.length &&
    (visible[next].hasAttribute('readonly') ||
      visible[next].hasAttribute('disabled') ||
      visible[next].classList.contains('disabled-input'))
  ) {
    forward ? next++ : next--;
  }

  if (next >= 0 && next < visible.length) {
    const el = visible[next];
    if (el.tagName.toLowerCase() === 'ng-select') {
      el.querySelector('input')?.focus();
    } else {
      el.focus();
    }
  }
}


  private tryFocus(el: HTMLElement): boolean {
    if (el.hasAttribute('readonly') || el.hasAttribute('disabled')) return false;

    if (el.tagName.toLowerCase() === 'ng-select') {
      const inner = el.querySelector('input');
      if (inner) {
        (inner as HTMLElement).focus();
        return true;
      }
      el.focus();
      return true;
    } else {
      el.focus();
      return true;
    }
  }

  private isVisible(el: HTMLElement): boolean {
    return !!(el.offsetParent !== null || el.getClientRects().length);
  }
}
