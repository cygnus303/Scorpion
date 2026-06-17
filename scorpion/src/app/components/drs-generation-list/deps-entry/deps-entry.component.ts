import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-deps-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deps-entry.component.html',
  styleUrl: './deps-entry.component.scss'
})
export class DepsEntryComponent {
  public modalRef!: BsModalRef;
  public drsNo: string = '';
  public depsNo: string = '';
  public dateStr: string = '21-Mar-26';
  public vendorName: string = 'Blue Dart Express';
  public totalDeliveredDockets: number = 5;
  
  @Output() dataEmitter = new EventEmitter<void>();
  @ViewChild('TemplateDeps', { static: true }) TemplateDeps!: TemplateRef<any>;

  public dummyDockets = [
    {
      docketNo: 'DKT/2526/20101',
      docketDate: '21-Mar-26',
      addDate: '21-Mar-26',
      route: 'MUM → DEL',
      delPkgs: 4,
      boxIds: ['DKT_2526_20101_001', 'DKT_2526_20101_002', 'DKT_2526_20101_003', 'DKT_2526_20101_004'],
      invoiceValue: 4750.00,
      depsType: '',
      damageType: '',
      severity: '',
      affectedPkgs: null,
      affectedInvVal: 0.00,
      remarks: '',
      fileAttached: false,
      fileName: ''
    },
    {
      docketNo: 'DKT/2526/20102',
      docketDate: '21-Mar-26',
      addDate: '21-Mar-26',
      route: 'MUM → BLR',
      delPkgs: 6,
      boxIds: ['DKT_2526_20102_001', 'DKT_2526_20102_002', 'DKT_2526_20102_003', 'DKT_2526_20102_004', 'DKT_2526_20102_005', 'DKT_2526_20102_006'],
      invoiceValue: 8550.00,
      depsType: '',
      damageType: '',
      severity: '',
      affectedPkgs: null,
      affectedInvVal: 0.00,
      remarks: '',
      fileAttached: false,
      fileName: ''
    },
    {
      docketNo: 'DKT/2526/20103',
      docketDate: '21-Mar-26',
      addDate: '21-Mar-26',
      route: 'MUM → HYD',
      delPkgs: 3,
      boxIds: ['DKT_2526_20103_001', 'DKT_2526_20103_002', 'DKT_2526_20103_003'],
      invoiceValue: 12875.00,
      depsType: '',
      damageType: '',
      severity: '',
      affectedPkgs: null,
      affectedInvVal: 0.00,
      remarks: '',
      fileAttached: false,
      fileName: ''
    },
    {
      docketNo: 'DKT/2526/20104',
      docketDate: '21-Mar-26',
      addDate: '21-Mar-26',
      route: 'MUM → CHN',
      delPkgs: 5,
      boxIds: ['DKT_2526_20104_001', 'DKT_2526_20104_002', 'DKT_2526_20104_003', 'DKT_2526_20104_004', 'DKT_2526_20104_005'],
      invoiceValue: 4225.00,
      depsType: '',
      damageType: '',
      severity: '',
      affectedPkgs: null,
      affectedInvVal: 0.00,
      remarks: '',
      fileAttached: false,
      fileName: ''
    },
    {
      docketNo: 'DKT/2526/20105',
      docketDate: '21-Mar-26',
      addDate: '21-Mar-26',
      route: 'MUM → PUN',
      delPkgs: 2,
      boxIds: ['DKT_2526_20105_001', 'DKT_2526_20105_002'],
      invoiceValue: 10150.00,
      depsType: '',
      damageType: '',
      severity: '',
      affectedPkgs: null,
      affectedInvVal: 0.00,
      remarks: '',
      fileAttached: false,
      fileName: ''
    },
    {
      docketNo: 'DKT/2526/20102',
      docketDate: '21-Mar-26',
      addDate: '21-Mar-26',
      route: 'MUM → BLR',
      delPkgs: 6,
      boxIds: ['DKT_2526_20102_001', 'DKT_2526_20102_002', 'DKT_2526_20102_003', 'DKT_2526_20102_004', 'DKT_2526_20102_005', 'DKT_2526_20102_006'],
      invoiceValue: 8550.00,
      depsType: '',
      damageType: '',
      severity: '',
      affectedPkgs: null,
      affectedInvVal: 0.00,
      remarks: '',
      fileAttached: false,
      fileName: ''
    },
    {
      docketNo: 'DKT/2526/20103',
      docketDate: '21-Mar-26',
      addDate: '21-Mar-26',
      route: 'MUM → HYD',
      delPkgs: 3,
      boxIds: ['DKT_2526_20103_001', 'DKT_2526_20103_002', 'DKT_2526_20103_003'],
      invoiceValue: 12875.00,
      depsType: '',
      damageType: '',
      severity: '',
      affectedPkgs: null,
      affectedInvVal: 0.00,
      remarks: '',
      fileAttached: false,
      fileName: ''
    },
    {
      docketNo: 'DKT/2526/20104',
      docketDate: '21-Mar-26',
      addDate: '21-Mar-26',
      route: 'MUM → CHN',
      delPkgs: 5,
      boxIds: ['DKT_2526_20104_001', 'DKT_2526_20104_002', 'DKT_2526_20104_003', 'DKT_2526_20104_004', 'DKT_2526_20104_005'],
      invoiceValue: 4225.00,
      depsType: '',
      damageType: '',
      severity: '',
      affectedPkgs: null,
      affectedInvVal: 0.00,
      remarks: '',
      fileAttached: false,
      fileName: ''
    },
    {
      docketNo: 'DKT/2526/20105',
      docketDate: '21-Mar-26',
      addDate: '21-Mar-26',
      route: 'MUM → PUN',
      delPkgs: 2,
      boxIds: ['DKT_2526_20105_001', 'DKT_2526_20105_002'],
      invoiceValue: 10150.00,
      depsType: '',
      damageType: '',
      severity: '',
      affectedPkgs: null,
      affectedInvVal: 0.00,
      remarks: '',
      fileAttached: false,
      fileName: ''
    }
  ];

  public activeBoxDropdownIndex: number | null = null;

  constructor(private modalService: BsModalService) {}

  showPopup(data: any, isEditMode: boolean = false) {
    this.drsNo = data.drsNo || 'DS/MUM/2526/0000302';
    this.depsNo = data.depsNo || 'DEPS/MUM/2526/0000302';
    this.vendorName = data.vendorName || 'Blue Dart Express';
    this.totalDeliveredDockets = data.totalDockets || 5;

    // Reset fields for fresh popup load
    this.dummyDockets.forEach((d) => {
      d.depsType = '';
      d.damageType = '';
      d.severity = '';
      d.affectedPkgs = null;
      d.affectedInvVal = 0.00;
      d.remarks = '';
      d.fileAttached = false;
      d.fileName = '';
    });

    this.modalRef = this.modalService.show(this.TemplateDeps, {class: 'modal-xxl modal-dialog-centered deps-entry-modal-wrapper',backdrop: 'static'});
  }

  toggleBoxDropdown(index: number, event: MouseEvent) {
    event.stopPropagation();
    if (this.activeBoxDropdownIndex === index) {
      this.activeBoxDropdownIndex = null;
    } else {
      this.activeBoxDropdownIndex = index;
    }
  }

  onFileSelected(row: any, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      row.fileName = input.files[0].name;
      row.fileAttached = true;
    }
  }

  closePopup() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  saveDepsForm() {
    this.closePopup();
    this.dataEmitter.emit();
  }

  closeBoxDropdowns() {
    this.activeBoxDropdownIndex = null;
  }
}
