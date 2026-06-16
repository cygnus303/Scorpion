import { Component, ElementRef, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormControl, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FocusNextDirective } from 'app/shared/directives/focusnext.directive';
import { SharedModule } from 'app/shared/shared/shared.module';

@Component({
  selector: 'app-drs-date-time-picker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    TimepickerModule,
    BsDatepickerModule,
    SharedModule
  ],
  templateUrl: './drs-date-time-picker.component.html',
  styleUrls: ['./drs-date-time-picker.component.scss']
})
export class DRSDateTimePickerComponent implements OnInit, OnDestroy {
  @Input() controlName!: string;      
  @Input() placeholder: string = 'Select Date';
  @Input() disabled: boolean = false;
  @Input() maxDate?: Date;
  @Input() minDate?: Date;
  @Input() appendTo?: string;

  @ViewChild('popover') popover!: NgbPopover;

  showPicker = false;

  selectedDate: Date = new Date();
  selectedTime: Date = new Date();
  displayDateTime: string = '';

  control!: FormControl;

  constructor(private controlContainer: ControlContainer, private elementRef: ElementRef) {}

  ngOnInit(): void {
    const parent = this.controlContainer.control as FormGroup | null;
    if (!parent) throw new Error('DatetimePicker must be inside a FormGroup.');

    const c = parent.get(this.controlName);
    if (!c) throw new Error(`FormControl '${this.controlName}' not found.`);
    this.control = c as FormControl;

    const value = this.control.value;
    if (value) {
      const dt = value instanceof Date ? value : new Date(value);
      if (!isNaN(dt.getTime())) {
        this.selectedDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        this.selectedTime = new Date(dt);
        this.updateFinal();
      }
    }

    document.addEventListener('click', this.handleOutsideClick);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  handleOutsideClick = (event: MouseEvent) => {
    if (!this.showPicker) return;
    const el = event.target as HTMLElement;
    if (this.appendTo === 'body') {
      const popoverEl = document.querySelector('.popover');
      if (!this.elementRef.nativeElement.contains(el) && (!popoverEl || !popoverEl.contains(el))) {
        this.showPicker = false;
        this.popover?.close();
      }
    } else {
      if (!this.elementRef.nativeElement.contains(el)) {
        this.showPicker = false;
      }
    }
  }

  togglePicker(event?: MouseEvent) {
    if (this.disabled) return;
    if (event) event.stopPropagation();
    this.showPicker = !this.showPicker;
    if (this.appendTo === 'body') {
      if (this.showPicker) {
        this.popover?.open();
      } else {
        this.popover?.close();
      }
    }
  }

  onIconClick(event: MouseEvent) {
    event.stopPropagation();
    this.togglePicker();
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
    this.showPicker = false;
    if (this.appendTo === 'body') {
      this.popover?.close();
    }
  }
}
