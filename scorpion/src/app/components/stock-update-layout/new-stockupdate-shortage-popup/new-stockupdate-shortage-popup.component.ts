import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormArray, FormControl, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SweetAlertService } from 'app/shared/services/sweet-alert.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-new-stockupdate-shortage-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './new-stockupdate-shortage-popup.component.html',
  styleUrls: ['./new-stockupdate-shortage-popup.component.scss']
})
export class NewStockupdateShortagePopupComponent {
  public modalRefs!: BsModalRef;
  public thcNo: string = '';
  public dateStr: string = '';
  public popupDocketNo: string = '';
  public popupDocketDate: string = '';
  public rowDataIndex: number = -1;

  @Output() dataEmitter = new EventEmitter<any>();
  @ViewChild('TemplateShortage', { static: true }) TemplateShortage!: TemplateRef<any>;

  public shortageForm!: FormGroup;
  public activeBoxDropdownIndex: number | null = null;

  public depsTypeList = [
    { value: 'S', label: '🟠 Shortage' }
  ];

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
      class: 'modal-xl modal-dialog-centered shortage-modal-wrapper',
      backdrop: 'static'
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
    const boxIds: string[] = [];
    let pkgsCount = +(item.affectedPkgs || item.shortQty || item.shortageQty || item.affectedQty || 0);
    if (pkgsCount <= 0 && item.bkG_PKGSNO !== undefined && item.pkgsno !== undefined) {
      pkgsCount = +(item.bkG_PKGSNO || 0) - +(item.pkgsno || 0);
    }
    if (pkgsCount <= 0) {
      pkgsCount = +(item.bkG_PKGSNO || item.pkgsno || 0);
    }

    const dockno = item.dockno || item.dockNo || item.docket || this.popupDocketNo;
    for (let k = 1; k <= pkgsCount; k++) {
      boxIds.push(`${dockno}_${k.toString().padStart(3, '0')}`);
    }

    let selectedBoxes = (item.selectedBoxIds || []).filter((id: string) => boxIds.includes(id));
    if (selectedBoxes.length === 0 && boxIds.length > 0) {
      selectedBoxes = [...boxIds];
    }
    const affectedPkgsVal = selectedBoxes.length;

    const totalPkgsVal = +(item.bkG_PKGSNO || item.deliveredPkgs || item.pkgsDelivered || (item.pkgsno && +item.pkgsno > pkgsCount ? +item.pkgsno : 0) || (item.pkgsno ? +item.pkgsno + +pkgsCount : 0) || pkgsCount || 1);
    const totalWtVal = +(item.bkG_ACTUWT || item.actuwt || item.totWeight || item.totalWeight || 0);

    let affectedInvValCalc = 0.00;
    let affectedWeightCalc = +(item.affectedWeight || item.shortWt || item.shortageWeight || 0);
    if (totalPkgsVal > 0 && affectedPkgsVal > 0) {
      affectedInvValCalc = Number((( (item.invval || 0) / totalPkgsVal ) * affectedPkgsVal).toFixed(2));
      if (totalWtVal > 0) {
        affectedWeightCalc = Number(((totalWtVal / totalPkgsVal) * affectedPkgsVal).toFixed(2));
      }
    }

    return new FormGroup({
      dockno: new FormControl(dockno),
      docketsf: new FormControl(item.docksf || item.docketsf || ''),
      dockdt: new FormControl(item.booking_Date || item.dockdt),
      orgncd: new FormControl(item.orgncd),
      destcd: new FormControl(item.destcd),
      pkgsno: new FormControl(pkgsCount),
      bkG_PKGSNO: new FormControl(totalPkgsVal),
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

    row.get('selectedBoxIds')?.setValue(selectedBoxes);
    row.get('affectedPkgs')?.setValue(selectedBoxes.length);
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

  closePopup() {
    if (this.modalRefs) {
      this.modalRefs.hide();
    }
  }

  saveShortageForm() {
    if (this.shortageForm.invalid) {
      this.shortageForm.markAllAsTouched();
      return;
    }

    const activeRows = this.docketsArray.controls.filter((c: any) => {
      const v = c.getRawValue();
      return (v.affectedPkgs && +v.affectedPkgs > 0);
    });

    if (activeRows.length === 0) {
      this.sweetAlertService.warning('Please select Box IDs from the dropdown to declare affected packages.');
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

    this.dataEmitter.emit({
      rowIndex: this.rowDataIndex,
      depsData: depsData[0]
    });

    this.closePopup();
  }
}
