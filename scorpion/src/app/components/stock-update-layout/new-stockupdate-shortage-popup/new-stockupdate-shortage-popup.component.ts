import { Component, EventEmitter, HostListener, OnDestroy, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormArray, FormControl, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-stockupdate-shortage-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './new-stockupdate-shortage-popup.component.html',
  styleUrls: ['./new-stockupdate-shortage-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewStockupdateShortagePopupComponent implements OnDestroy {
  public modalRefs!: BsModalRef;
  public thcNo: string = '';
  public dateStr: string = '';
  public popupDocketNo: string = '';
  public popupDocketDate: string = '';
  public rowDataIndex: number = -1;
  public isSaved: boolean = false;
  public isSubmitted: boolean = false;
  private isCancelledEmitted: boolean = false;
  private modalHiddenSub?: Subscription;

  @Output() dataEmitter = new EventEmitter<any>();
  @Output() cancelEmitter = new EventEmitter<any>();
  @ViewChild('TemplateShortage', { static: true }) TemplateShortage!: TemplateRef<any>;

  public shortageForm!: FormGroup;
  public activeBoxDropdownIndex: number | null = null;

  public depsTypeList = [
    { value: 'S', label: '🟠 Shortage' }
  ];

  @HostListener('document:click')
  onDocumentClick() {
    this.closeBoxDropdowns();
  }

  constructor(
    private modalService: BsModalService,
    private sweetAlertService: SweetAlertService
  ) {}

  get docketsArray(): FormArray {
    return this.shortageForm?.get('dockets') as FormArray;
  }

  showPopup(data: any, thcNo: string, dateStr: string, index: number) {
    this.thcNo = thcNo;
    this.dateStr = dateStr;
    this.rowDataIndex = index;
    this.isSaved = false;
    this.isSubmitted = false;
    this.isCancelledEmitted = false;
    this.activeBoxDropdownIndex = null;

    this.popupDocketNo = data?.dockno || data?.dockNo || data?.docketNo || '';
    if (data?.booking_Date || data?.dockdt) {
      this.popupDocketDate = this.formatDateForHeader(data?.booking_Date || data?.dockdt);
    } else {
      this.popupDocketDate = dateStr || '';
    }

    this.shortageForm = new FormGroup({
      dockets: new FormArray([])
    });

    this.modalRefs = this.modalService.show(this.TemplateShortage, {
      class: 'modal-xxl modal-dialog-centered shortage-modal-wrapper',
      backdrop: true,
      ignoreBackdropClick: false
    });

    this.modalHiddenSub?.unsubscribe();
    this.modalHiddenSub = this.modalRefs.onHidden?.subscribe(() => {
      this.notifyCancel();
    });

    const formData = data.depsData && data.depsData.depsTyp === 'S' ? { ...data.depsData, ...data, affectedPkgs: data.affectedPkgs !== undefined ? data.affectedPkgs : data.depsData.affectedQty } : data;
    this.populateForm([formData]);
  }

  formatDateForHeader(dateInput: any): string {
    if (!dateInput) return '';
    try {
      if (dateInput instanceof Date) {
        return this.formatDateObj(dateInput);
      }
      const d = new Date(dateInput);
      if (!isNaN(d.getTime())) {
        return this.formatDateObj(d);
      }
      return dateInput.toString();
    } catch (e) {
      return dateInput.toString();
    }
  }

  private formatDateObj(d: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  populateForm(docketsData: any[]) {
    const formArray = this.docketsArray;
    formArray.clear();

    docketsData.forEach((docketItem: any) => {
      formArray.push(this.createDocketFormGroup(docketItem));
    });
  }

  createDocketFormGroup(item: any): FormGroup {
    const dockno = item.dockno || item.dockNo || item.docket || this.popupDocketNo || '';
    const totalDocketPkgs = +(item.bkG_PKGSNO || item.pkgsno || 0);
    const totalWtVal = +(item.bkG_ACTUWT || item.actuwt || 0);

    // 1. ડૉકેટના કુલ પેકેજ મુજબ બધા Box IDs જનરેટ કરવા (દા.ત. 1 થી totalDocketPkgs)
    const boxIds: string[] = [];
    for (let k = 1; k <= totalDocketPkgs; k++) {
      boxIds.push(`${dockno}_${k.toString().padStart(3, '0')}`);
    }

    // 2. શરૂઆતમાં કોઈ Box ID જાતે સિલેક્ટ નહીં થાય (User પોતે સિલેક્ટ કરશે)
    const selectedBoxes: string[] = (item.selectedBoxIds && Array.isArray(item.selectedBoxIds))
      ? item.selectedBoxIds.filter((id: string) => boxIds.includes(id))
      : [];
    const affectedPkgsVal = selectedBoxes.length;

    // 3. Arrived Packages = કુલ પેકેજ - સિલેક્ટ કરેલા Shortage Boxes
    const arrivedPkgsCount = Math.max(0, totalDocketPkgs - affectedPkgsVal);

    // 4. Shortage Weight અને Invoice Value ની ગણતરી
    let affectedInvValCalc = 0.00;
    let affectedWeightCalc = 0.00;
    if (totalDocketPkgs > 0 && affectedPkgsVal > 0) {
      affectedInvValCalc = Number((((item.invval || 0) / totalDocketPkgs) * affectedPkgsVal).toFixed(2));
      if (totalWtVal > 0) {
        affectedWeightCalc = Number(((totalWtVal / totalDocketPkgs) * affectedPkgsVal).toFixed(2));
      }
    }

    return new FormGroup({
      dockno: new FormControl(dockno),
      docketsf: new FormControl(item.docksf || item.docketsf || ''),
      dockdt: new FormControl(item.booking_Date || item.dockdt),
      orgncd: new FormControl(item.orgncd),
      destcd: new FormControl(item.destcd),
      pkgsno: new FormControl(arrivedPkgsCount),
      bkG_PKGSNO: new FormControl(totalDocketPkgs),
      bkG_ACTUWT: new FormControl(totalWtVal),
      invval: new FormControl(item.invval || 0),
      depstype: new FormControl('S'),
      affectedPkgs: new FormControl(affectedPkgsVal),
      affectedInvVal: new FormControl(affectedInvValCalc),
      affectedWeight: new FormControl(affectedWeightCalc),
      remarks: new FormControl(item.remarks || item.shortRemarks || item.shortageRemarks || ''),
      boxIds: new FormControl(boxIds),
      selectedBoxIds: new FormControl(selectedBoxes),
      depsNo: new FormControl(item.depsNo || '')
    });
  }

  toggleBoxDropdown(index: number, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.activeBoxDropdownIndex = this.activeBoxDropdownIndex === index ? null : index;
  }

  closeBoxDropdowns() {
    this.activeBoxDropdownIndex = null;
  }

  isBoxSelected(rowIndex: number, boxId: string): boolean {
    const row = this.docketsArray.at(rowIndex) as FormGroup;
    const selectedBoxes = row.get('selectedBoxIds')?.value || [];
    return selectedBoxes.includes(boxId);
  }

  toggleBoxSelection(rowIndex: number, boxId: string) {
    const row = this.docketsArray.at(rowIndex) as FormGroup;
    const selectedBoxes = [...(row.get('selectedBoxIds')?.value || [])];
    const index = selectedBoxes.indexOf(boxId);

    if (index > -1) {
      selectedBoxes.splice(index, 1);
    } else {
      selectedBoxes.push(boxId);
    }

    const totalPkgs = +row.get('bkG_PKGSNO')?.value || 0;
    const affectedCount = selectedBoxes.length;
    const newArrivedPkgs = Math.max(0, totalPkgs - affectedCount);

    row.get('selectedBoxIds')?.setValue(selectedBoxes);
    row.get('affectedPkgs')?.setValue(affectedCount);
    row.get('pkgsno')?.setValue(newArrivedPkgs);
    this.onAffectedPkgsChange(rowIndex);
  }

  getSelectedBoxesLabel(rowIndex: number): string {
    const row = this.docketsArray.at(rowIndex) as FormGroup;
    const selectedBoxes = row.get('selectedBoxIds')?.value || [];
    if (selectedBoxes.length === 0) {
      return 'Select Box IDs...';
    }
    if (selectedBoxes.length === 1) {
      return selectedBoxes[0];
    }
    return `${selectedBoxes.length} Boxes Selected`;
  }

  onAffectedPkgsChange(rowIndex: number) {
    const row = this.docketsArray.at(rowIndex) as FormGroup;
    const affectedPkgsCount = +row.get('affectedPkgs')?.value || 0;
    const invval = +row.get('invval')?.value || 0;
    const totalPkgs = +row.get('bkG_PKGSNO')?.value || +row.get('pkgsno')?.value || 1;
    const totalWt = +row.get('bkG_ACTUWT')?.value || 0;
    let rawInvVal = 0.00;
    let rawWt = 0.00;
    if (totalPkgs > 0 && affectedPkgsCount > 0) {
      rawInvVal = (invval / totalPkgs) * affectedPkgsCount;
      rawInvVal = Number(rawInvVal.toFixed(2));
      if (totalWt > 0) {
        rawWt = (totalWt / totalPkgs) * affectedPkgsCount;
        rawWt = Number(rawWt.toFixed(2));
      }
    }
    row.get('affectedInvVal')?.setValue(rawInvVal);
    row.get('affectedWeight')?.setValue(rawWt);
  }

  clearLossValueOnFocus(rowIndex: number) {
    const row = this.docketsArray.at(rowIndex) as FormGroup;
    const ctrl = row?.get('affectedInvVal');
    if (ctrl) {
      const val = ctrl.value;
      if (val === 0 || val === '0' || val === '0.00' || Number(val) === 0) {
        ctrl.setValue(null);
      }
    }
  }

  resetLossValueOnBlur(rowIndex: number) {
    const row = this.docketsArray.at(rowIndex) as FormGroup;
    const ctrl = row?.get('affectedInvVal');
    if (ctrl) {
      const val = ctrl.value;
      if (val === '' || val === null || val === undefined || String(val).trim() === '') {
        ctrl.setValue(0);
      } else {
        const num = Number(val);
        ctrl.setValue(!isNaN(num) ? num : 0);
      }
    }
  }

  private notifyCancel() {
    if (!this.isSaved && !this.isCancelledEmitted) {
      this.isCancelledEmitted = true;
      this.cancelEmitter.emit({
        rowIndex: this.rowDataIndex
      });
    }
  }

  closePopup() {
    this.closeBoxDropdowns();
    this.notifyCancel();
    if (this.modalRefs) {
      this.modalRefs.hide();
    }
  }

  ngOnDestroy() {
    this.modalHiddenSub?.unsubscribe();
  }

  hasInvalidRows(): boolean {
    return this.docketsArray.controls.some((c: any) => {
      const v = c.getRawValue();
      return !v.selectedBoxIds || v.selectedBoxIds.length === 0;
    });
  }

  saveShortageForm() {
    this.isSubmitted = true;
    if (this.shortageForm.invalid || this.hasInvalidRows()) {
      this.shortageForm.markAllAsTouched();
      return;
    }

    const activeRows = this.docketsArray.controls.filter((c: any) => {
      const v = c.getRawValue();
      return (v.affectedPkgs && +v.affectedPkgs > 0);
    });

    if (activeRows.length === 0) {
      this.sweetAlertService.warning('Please enter valid shortage packages.');
      return;
    }

    const depsData = activeRows.map((c: any) => {
      const v = c.getRawValue();
      return {
        documentNo: this.thcNo,
        docket: v.dockno || '',
        docketsf: v.docketsf || '',
        pkgsDelivered: v.pkgsno || 0,
        totWeight: +v.bkG_ACTUWT || 0,
        affectedQty: +v.affectedPkgs || 0,
        affectedWeight: +v.affectedWeight || 0,
        affectedInvVal: +v.affectedInvVal || 0,
        fileName: '',
        depsfile: '',
        reason: '',
        remarks: v.remarks || '',
        depsTyp: 'S',
        damageType: '',
        severity: '',
        invval: Number(v.invval) || 0,
        depsNo: v.depsNo || "",
        selectedBoxIds: v.selectedBoxIds,
        booking_Date: v.dockdt,
        orgncd: v.orgncd,
        destcd: v.destcd
      };
    });

    this.isSaved = true;
    this.dataEmitter.emit({
      rowIndex: this.rowDataIndex,
      depsData: depsData[0]
    });

    this.closePopup();
  }
}
