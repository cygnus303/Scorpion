import { Component, EventEmitter, Input, OnInit, OnChanges, Output, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, BsDatepickerModule, FormsModule],
  template: `
    <div class="date-picker-container" [ngClass]="'theme-' + theme">
      <!-- Trigger Button -->
      <button type="button" class="trigger-btn" (click)="togglePicker($event)">
        <i class="far fa-calendar-alt"></i>
        <span>{{ initialFromDate | date:'dd/MM/yyyy' }} – {{ initialToDate | date:'dd/MM/yyyy' }}</span>
        <i class="fas fa-chevron-down caret" [class.rotated]="showPicker"></i>
      </button>

      <!-- Dropdown Panel -->
      <div class="picker-dropdown" *ngIf="showPicker" (click)="$event.stopPropagation()">

        <!-- Left: Quick Select -->
        <div class="presets-section">
          <div class="preset-header">QUICK SELECT</div>
          <button *ngFor="let r of ranges"
                  type="button"
                  [class.active]="activeRangeLabel === r.label"
                  (click)="selectPreset(r)">
            <i [class]="r.icon"></i>
            {{ r.label }}
          </button>
        </div>

        <!-- Right: Custom Range -->
        <div class="custom-range-section">
          <div class="section-header">
            <span class="section-title">CUSTOM RANGE</span>
            <span class="range-info">Select start &amp; end dates</span>
          </div>

          <div class="inputs-row">
            <div class="input-group-custom">
              <label>FROM</label>
              <div class="input-wrapper">
                <i class="far fa-calendar-alt"></i>
                <input type="text"
                       placeholder="DD/MM/YYYY"
                       class="form-control"
                       bsDatepicker
                       [(ngModel)]="tempStartDate"
                       [bsConfig]="bsConfig"
                       placement="bottom"
                       container="body"
                       readonly />
              </div>
            </div>
            <div class="arrow-divider">
              <i class="fas fa-arrow-right"></i>
            </div>
            <div class="input-group-custom">
              <label>TO</label>
              <div class="input-wrapper">
                <i class="far fa-calendar-check"></i>
                <input type="text"
                       placeholder="DD/MM/YYYY"
                       class="form-control"
                       bsDatepicker
                       [(ngModel)]="tempEndDate"
                       [minDate]="tempStartDate"
                       [bsConfig]="bsConfig"
                       placement="bottom"
                       container="body"
                       readonly />
              </div>
            </div>
          </div>

          <div class="actions-row">
            <button type="button" class="btn-apply" (click)="applyCustomRange()">
              <i class="fas fa-check"></i> Apply Range
            </button>
            <button type="button" class="btn-cancel" (click)="closePicker()">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { font-family: 'Inter', sans-serif; }

        .date-picker-container {
      position: relative;
      display: inline-block;
      
      &.theme-indigo {
        --theme-primary: #6366f1;
        --theme-primary-hover: #4f46e5;
        --theme-primary-bg: #eef2ff;
        --theme-primary-border: #c7d2fe;
        --theme-primary-light-hover: #e0e7ff;
        --theme-primary-text: #4338ca;
        --theme-primary-border-light: #ddd6fe;
        --theme-primary-bg-light: #f5f3ff;
        --theme-primary-hover-border: #a5b4fc;
        --theme-primary-shadow-light: rgba(99,102,241,0.1);
        --theme-primary-shadow-md: rgba(99,102,241,0.14);
        --theme-primary-shadow: rgba(99,102,241,0.25);
        --theme-primary-shadow-focus: rgba(99,102,241,0.12);
      }
      
      &.theme-red {
        --theme-primary: #dc2626;
        --theme-primary-hover: #b91c1c;
        --theme-primary-bg: #fef2f2;
        --theme-primary-border: #fecaca;
        --theme-primary-light-hover: #fee2e2;
        --theme-primary-text: #991b1b;
        --theme-primary-border-light: #fca5a5;
        --theme-primary-bg-light: #fff1f2;
        --theme-primary-hover-border: #f87171;
        --theme-primary-shadow-light: rgba(220,38,38,0.1);
        --theme-primary-shadow-md: rgba(220,38,38,0.14);
        --theme-primary-shadow: rgba(220,38,38,0.25);
        --theme-primary-shadow-focus: rgba(220,38,38,0.12);
      }
    }

    /* ---- Trigger Button ---- */
    .trigger-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      height: 32px;
      background: #fff;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;

      i { color: var(--theme-primary); font-size: 13px; }

      .caret {
        font-size: 10px;
        color: #9ca3af;
        transition: transform 0.2s;
        &.rotated { transform: rotate(180deg); }
      }

      &:hover {
        border-color: var(--theme-primary);
        box-shadow: 0 0 0 3px var(--theme-primary-shadow-light);
      }
    }

    /* ---- Dropdown Panel ---- */
    .picker-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.14);
      z-index: 99;
      display: flex;
      min-width: 520px;
      border: 1px solid var(--theme-primary-shadow-light);
      animation: fadeDown 0.2s ease;
    }

    @keyframes fadeDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ---- Quick Select ---- */
    .presets-section {
      width: 175px;
      background: var(--theme-primary-bg);
      border-right: 1px solid var(--theme-primary-border);
      border-radius: 16px 0 0 16px;
      padding: 16px 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;

      .preset-header {
        font-size: 10px;
        font-weight: 800;
        color: var(--theme-primary);
        letter-spacing: 1px;
        margin-bottom: 8px;
        padding-left: 10px;
        opacity: 0.8;
      }

      button {
        display: flex;
        align-items: center;
        gap: 8px;
        text-align: left;
        background: transparent;
        border: none;
        padding: 9px 12px;
        font-size: 13px;
        color: var(--theme-primary-text);
        font-weight: 500;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.18s;
        width: 100%;

        i { font-size: 13px; }

        &:hover {
          background: var(--theme-primary-light-hover);
          color: var(--theme-primary-hover);
          padding-left: 16px;
        }

        &.active {
          background: var(--theme-primary);
          color: #fff;
          box-shadow: 0 4px 12px var(--theme-primary-shadow);
        }
      }
    }

    /* ---- Custom Range ---- */
    .custom-range-section {
      flex: 1;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 18px;

      .section-header {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .section-title {
          font-size: 11px;
          font-weight: 800;
          color: var(--theme-primary);
          letter-spacing: 0.8px;
        }
        .range-info {
          font-size: 12px;
          color: #64748b;
        }
      }
    }

    .inputs-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .arrow-divider {
      color: var(--theme-primary-border);
      margin-top: 20px;
      font-size: 14px;
    }

    .input-group-custom {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;

      label {
        font-size: 11px;
        font-weight: 700;
        color: #475569;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .input-wrapper {
        position: relative;

        i {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--theme-primary);
          font-size: 13px;
          pointer-events: none;
        }

        input {
          width: 100%;
          padding: 9px 12px 9px 34px;
          border: 1px solid var(--theme-primary-border-light);
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
          background: var(--theme-primary-bg-light);
          cursor: pointer;
          transition: all 0.2s;

          &:hover { border-color: var(--theme-primary-hover-border); }
          &:focus {
            border-color: var(--theme-primary);
            background: #fff;
            box-shadow: 0 0 0 3px var(--theme-primary-shadow-focus);
            outline: none;
          }
        }
      }
    }

    .actions-row {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 16px;
      border-top: 1px solid #f1f5f9;

      button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 9px 20px;
        border-radius: 9px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
      }

      .btn-apply {
        background: var(--theme-primary);
        color: #fff;
        box-shadow: 0 4px 12px var(--theme-primary-shadow);
        &:hover { background: var(--theme-primary-hover); transform: translateY(-1px); }
      }

      .btn-cancel {
        background: #f1f5f9;
        color: #64748b;
        &:hover { background: #e2e8f0; color: #1e293b; }
      }
    }
  `]
})
export class DateRangePickerComponent implements OnInit, OnChanges {
  @Input() initialFromDate!: Date;
  @Input() initialToDate!: Date;
  @Input() theme: string = 'indigo';
  @Output() onRangeSelect = new EventEmitter<{ fromDate: Date, toDate: Date, rangeType: string }>();

  showPicker = false;
  activeRangeLabel = '';
  tempStartDate: Date = new Date();
  tempEndDate: Date = new Date();

  bsConfig: Partial<BsDatepickerConfig> = {
    containerClass: this.theme === 'red' ? 'theme-red' : 'theme-indigo',
    dateInputFormat: 'DD/MM/YYYY',
    showWeekNumbers: false,
  };

  ranges = [
    { label: 'Today',      icon: 'fas fa-calendar-day',   days: [0, 0] },
    { label: 'Yesterday',  icon: 'fas fa-history',        days: [-1, -1] },
    { label: 'Last 7 Days',icon: 'fas fa-calendar-week',  days: [-6, 0] },
    { label: 'Last 30 Days',icon:'fas fa-calendar-alt',   days: [-29, 0] },
    { label: 'This Month', icon: 'fas fa-calendar-check', isMonth: 'current' },
    { label: 'Last Month', icon: 'fas fa-calendar-minus', isMonth: 'last' },
  ];

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.bsConfig.containerClass = this.theme === 'red' ? 'theme-red' : 'theme-indigo';
    this.tempStartDate = this.initialFromDate ? new Date(this.initialFromDate) : new Date();
    this.tempEndDate   = this.initialToDate   ? new Date(this.initialToDate)   : new Date();
  }

  ngOnChanges() {
    this.bsConfig.containerClass = this.theme === 'red' ? 'theme-red' : 'theme-indigo';
    this.tempStartDate = this.initialFromDate ? new Date(this.initialFromDate) : new Date();
    this.tempEndDate   = this.initialToDate   ? new Date(this.initialToDate)   : new Date();
  }

  togglePicker(event: MouseEvent) {
    event.stopPropagation();
    this.showPicker = !this.showPicker;
    if (this.showPicker) {
      this.tempStartDate = new Date(this.initialFromDate || new Date());
      this.tempEndDate   = new Date(this.initialToDate   || new Date());
    }
  }

  closePicker() { this.showPicker = false; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const inside = this.el.nativeElement.contains(target);
    const onCal  = !!target.closest('.bs-datepicker-container') || !!target.closest('.bs-calendar-container');
    if (!inside && !onCal) this.showPicker = false;
  }

  selectPreset(r: any) {
    const today = new Date();
    let from: Date, to: Date;

    if (r.isMonth === 'current') {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (r.isMonth === 'last') {
      from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      to   = new Date(today.getFullYear(), today.getMonth(), 0);
    } else {
      from = new Date(today.getFullYear(), today.getMonth(), today.getDate() + r.days[0]);
      to   = new Date(today.getFullYear(), today.getMonth(), today.getDate() + r.days[1]);
    }

    this.activeRangeLabel = r.label;
    this.initialFromDate  = from;
    this.initialToDate    = to;
    this.onRangeSelect.emit({ fromDate: from, toDate: to, rangeType: r.label });
    this.showPicker = false;
  }

  applyCustomRange() {
    if (!this.tempStartDate || !this.tempEndDate) return;
    const from = new Date(this.tempStartDate);
    const to   = new Date(this.tempEndDate);
    this.activeRangeLabel = 'Custom Range';
    this.initialFromDate  = from;
    this.initialToDate    = to;
    this.onRangeSelect.emit({ fromDate: from, toDate: to, rangeType: 'custom' });
    this.showPicker = false;
  }
}
