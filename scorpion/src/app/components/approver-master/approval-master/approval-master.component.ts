import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-approval-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approval-master.component.html',
  styleUrl: './approval-master.component.scss'
})
export class ApprovalMasterComponent implements OnInit {
  approvalMode: 'All' | 'Criteria Base' = 'All';

  apmDocOpts = ['PRS', 'DRS', 'THC', 'HCC'];
  apmSvcOpts = ['LTL', 'FTL'];
  apmOdaOpts = ['ODA', 'Non ODA'];
  apmCatOpts = ['A', 'B', 'C', 'E'];
  apmSortOpts = ['Less Than', 'Greater Than', 'Less Than Equal To', 'Greater Than Equal To'];
  apmVndByDoc: any = {
    PRS: ['Market'],
    DRS: ['Market'],
    HCC: ['Market'],
    THC: ['Market']
  };
  apmDevBase = ['CPK', 'Utilization'];
  apmDevThcFtl = ['CPK', 'Utilization', 'Margin'];

  apmRows: any[] = [];
  apmSavedRecs: any[] = [];
  toastMsg = '';
  toastType = '';
  showToast = false;
  rowIdSeq = 0;

  ngOnInit() {
    this.addRow();
  }

  addRow() {
    this.rowIdSeq++;
    this.apmRows.push({
      id: this.rowIdSeq,
      doc: '',
      svc: '',
      oda: '',
      cat: '',
      vnd: '',
      dev: '',
      sort: '',
      val: '',
      docErr: false
    });
  }

  removeRow(index: number) {
    this.apmRows.splice(index, 1);
  }

  docChanged(row: any) {
    row.docErr = false;
    
    // Reset dependant fields
    row.svc = '';
    row.oda = '';
    row.cat = '';
    row.vnd = '';
    row.dev = '';
  }

  getSvcDisabled(row: any): boolean {
    return row.doc !== 'THC';
  }

  getOdaDisabled(row: any): boolean {
    return row.doc !== 'DRS';
  }

  getCatDisabled(row: any): boolean {
    return row.oda !== 'ODA' || this.getOdaDisabled(row);
  }

  getDevOpts(row: any): string[] {
    if (row.doc === 'THC' && row.svc === 'FTL') {
      return this.apmDevThcFtl;
    }
    return this.apmDevBase;
  }

  validate(): boolean {
    if (this.apmRows.length === 0) {
      this.displayToast('Please add at least one row.', 'error');
      return false;
    }

    let ok = true;
    this.apmRows.forEach(row => {
      row.docErr = !row.doc;
      if (!row.doc) ok = false;
    });

    return ok;
  }

  submitForm() {
    if (!this.validate()) return;

    let count = 0;
    this.apmRows.forEach(row => {
      this.apmSavedRecs.push({
        doc: row.doc,
        svc: row.svc || 'N/A',
        oda: row.oda || 'N/A',
        cat: row.cat || 'N/A',
        vnd: row.vnd || 'N/A',
        dev: row.dev || 'N/A',
        sort: row.sort || 'N/A',
        val: row.val || 'N/A',
        ts: new Date().toLocaleString('en-IN')
      });
      count++;
    });

    this.apmRows = [];
    this.displayToast(`✓ ${count} record(s) saved successfully!`, 'success');
    setTimeout(() => this.addRow(), 350);
  }

  displayToast(msg: string, type: string = 'success') {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3200);
  }
}
