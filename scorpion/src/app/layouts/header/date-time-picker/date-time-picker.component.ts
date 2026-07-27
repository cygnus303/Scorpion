// src/app/shared/date-time-picker/date-time-picker.component.ts
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbDateStruct, NgbPopover, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit {
   @Input() controlName!: string;      
  @Input() placeholder: string = 'Select Date';
  @Input() disabled: boolean = false;
  @Input() maxDate?: Date;
  @Input() minDate?: Date;
  @Input() dropUp: boolean = false;
  @Input() placement: 'bottom' | 'top' = 'bottom';

  @ViewChild('popupEl') popupEl?: ElementRef<HTMLElement>;

  showPicker = false;

  selectedDate: Date = new Date();
  selectedTime: Date = new Date();
  displayDateTime: string = '';

  control!: FormControl;

  constructor(private controlContainer: ControlContainer, private elementRef: ElementRef) {}

  ngOnInit(): void {
    // get control from parent form
    const parent = this.controlContainer.control as FormGroup | null;
    if (!parent) throw new Error('DatetimePicker must be inside a FormGroup.');

    const c = parent.get(this.controlName);
    if (!c) throw new Error(`FormControl '${this.controlName}' not found.`);
    this.control = c as FormControl;

    // initialize from existing value
    const value = this.control.value;
    if (value) {
      const dt = value instanceof Date ? value : new Date(value);
      if (!isNaN(dt.getTime())) {
        this.selectedDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        this.selectedTime = new Date(dt);
        this.updateFinal();
      }
    }

    // close popup when clicking outside
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
    this.removePopupFromBody();
  }

  handleOutsideClick(event: MouseEvent) {
    if (!this.showPicker) return;
    const el = event.target as HTMLElement;
    const isClickInsideInput = this.elementRef.nativeElement.contains(el);
    const isClickInsidePopup = this.popupEl?.nativeElement?.contains(el);
    if (!isClickInsideInput && !isClickInsidePopup) {
      this.applyDateTime();
    }
  }

  togglePicker(event?: MouseEvent) {
    if (this.disabled) return;
    if (event) event.stopPropagation();
    if (this.showPicker) {
      this.closePicker();
    } else {
      this.showPicker = true;
      setTimeout(() => this.positionPopup(), 0);
    }
  }

  onIconClick(event: MouseEvent) {
    event.stopPropagation();
    this.togglePicker();
  }

  closePicker() {
    this.showPicker = false;
    this.removePopupFromBody();
  }

  removePopupFromBody() {
    if (this.popupEl && this.popupEl.nativeElement.parentNode === document.body) {
      document.body.removeChild(this.popupEl.nativeElement);
    }
  }

  positionPopup() {
    if (!this.popupEl) return;
    const popupNode = this.popupEl.nativeElement;
    const inputRect = this.elementRef.nativeElement.getBoundingClientRect();

    if (popupNode.parentNode !== document.body) {
      document.body.appendChild(popupNode);
    }

    popupNode.style.position = 'fixed';
    popupNode.style.zIndex = '105000';

    const popupWidth = popupNode.offsetWidth || 310;
    let left = inputRect.left;
    if (left + popupWidth > window.innerWidth - 10) {
      left = window.innerWidth - popupWidth - 10;
    }
    if (left < 10) left = 10;
    popupNode.style.left = `${left}px`;

    const popupHeight = popupNode.offsetHeight || 380;
    const spaceBelow = window.innerHeight - inputRect.bottom;
    const shouldDropUp = this.placement === 'top' || this.dropUp || (spaceBelow < popupHeight && inputRect.top > popupHeight);

    if (shouldDropUp) {
      let top = inputRect.top - popupHeight - 4;
      if (top < 10) {
        top = 10;
      }
      popupNode.style.top = `${top}px`;
      popupNode.style.bottom = 'auto';
    } else {
      let top = inputRect.bottom + 4;
      if (top + popupHeight > window.innerHeight - 10) {
        top = window.innerHeight - popupHeight - 10;
      }
      popupNode.style.top = `${top}px`;
      popupNode.style.bottom = 'auto';
    }
  }

  updateFinal() {
    if (!this.selectedDate) {
      this.displayDateTime = '';
      return;
    }

    const hours = this.selectedTime?.getHours() ?? 0;
    const minutes = this.selectedTime?.getMinutes() ?? 0;

    const final = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth(),
      this.selectedDate.getDate(),
      hours,
      minutes
    );

    this.displayDateTime = final.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  applyDateTime() {
    if (!this.selectedDate) return;

    const final = new Date(
      this.selectedDate.getFullYear(),
      this.selectedDate.getMonth(),
      this.selectedDate.getDate(),
      this.selectedTime?.getHours() ?? 0,
      this.selectedTime?.getMinutes() ?? 0
    );

    this.control.patchValue(final);
    this.updateFinal();
    this.closePicker();
  }
}
