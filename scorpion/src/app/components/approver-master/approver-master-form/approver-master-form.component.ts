import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-approver-master-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approver-master-form.component.html',
  styleUrl: './approver-master-form.component.scss',
})
export class ApproverMasterFormComponent implements OnInit {
  // Master data
  master = [
    { id: 'u1', name: 'John Smith', type: 'user', dept: 'Finance' },
    { id: 'u2', name: 'Jane Doe', type: 'user', dept: 'Operations' },
    { id: 'u3', name: 'Bob Johnson', type: 'user', dept: 'Logistics' },
    { id: 'u4', name: 'Alice Williams', type: 'user', dept: 'Finance' },
    { id: 'u5', name: 'Charlie Brown', type: 'user', dept: 'HR' },
    { id: 'u6', name: 'Diana Prince', type: 'user', dept: 'Operations' },
    { id: 'u7', name: 'Edward Norton', type: 'user', dept: 'IT' },
    { id: 'u8', name: 'Fiona Green', type: 'user', dept: 'Finance' },
    { id: 'u9', name: 'Raj Mehta', type: 'user', dept: 'Logistics' },
    { id: 'r1', name: 'Admin', type: 'role' },
    { id: 'r2', name: 'Finance Manager', type: 'role' },
    { id: 'r3', name: 'Operations Head', type: 'role' },
    { id: 'r4', name: 'Supervisor', type: 'role' },
    { id: 'r5', name: 'Executive', type: 'role' },
    { id: 'r6', name: 'Coordinator', type: 'role' },
    { id: 'r7', name: 'Branch Manager', type: 'role' },
    { id: 'r8', name: 'Director', type: 'role' },
  ];

  docs = ['PRS', 'THC', 'DRS', 'HCC', 'Bills'];
  svcTypes = ['LTL', 'FTL'];
  vndTypes = ['Market', 'Attached', 'Business Associate', 'Handling Vendor'];

  rows: any[] = [];
  savedRecs: any[] = [];
  toastMsg = '';
  toastType = '';
  showToast = false;
  rowIdSeq = 0;

  ngOnInit() {
    this.addRow();
  }

  addRow() {
    this.rowIdSeq++;
    this.rows.push({
      id: this.rowIdSeq,
      doc: '',
      svc: '',
      vnd: '',
      docErr: false,
      svcErr: false,
      vndErr: false,
      dupErr: false,
      initiator: { mode: 'all', search: '', selected: null, showDd: false },
      approver1: { mode: 'all', search: '', selected: null, showDd: false },
      approver2: { mode: 'all', search: '', selected: null, showDd: false },
      finalApprover: { mode: 'all', search: '', selected: null, showDd: false },
    });
  }

  removeRow(index: number) {
    this.rows.splice(index, 1);
  }

  setMode(row: any, field: string, mode: string) {
    row[field].mode = mode;
  }

  getFilteredList(row: any, field: string) {
    const q = row[field].search.toLowerCase().trim();
    const mode = row[field].mode;

    return this.master.filter((m) => {
      if (mode === 'user' && m.type !== 'user') return false;
      if (mode === 'role' && m.type !== 'role') return false;
      if (q && !m.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }

  getUsers(row: any, field: string) {
    return this.getFilteredList(row, field).filter((m) => m.type === 'user');
  }

  getRoles(row: any, field: string) {
    return this.getFilteredList(row, field).filter((m) => m.type === 'role');
  }

  isUsedElsewhere(row: any, field: string, id: string) {
    const fields = ['initiator', 'approver1', 'approver2', 'finalApprover'];
    for (const f of fields) {
      if (f !== field && row[f].selected?.id === id) return true;
    }
    return false;
  }

  selectItem(row: any, field: string, item: any) {
    if (this.isUsedElsewhere(row, field, item.id)) return;
    row[field].selected = item;
    row[field].showDd = false;
  }

  clearSelection(row: any, field: string) {
    row[field].selected = null;
    row[field].search = '';
  }

  validate(): boolean {
    if (this.rows.length === 0) {
      this.displayToast('Please add at least one row.', 'error');
      return false;
    }

    let ok = true;
    let dupMsg = '';
    const formKeys = new Set();
    const savedKeys = new Set(this.savedRecs.map((r) => `${r.doc}||${r.svc}||${r.vnd}`));

    this.rows.forEach((row) => {
      row.docErr = !row.doc;
      row.svcErr = !row.svc;
      row.vndErr = !row.vnd;
      row.dupErr = false;

      if (!row.doc || !row.svc || !row.vnd) {
        ok = false;
      } else {
        const key = `${row.doc}||${row.svc}||${row.vnd}`;
        if (savedKeys.has(key) || formKeys.has(key)) {
          row.dupErr = true;
          dupMsg = `${row.doc} + ${row.svc} + ${row.vnd}`;
          ok = false;
        } else {
          formKeys.add(key);
        }
      }
    });

    if (dupMsg) this.displayToast(`Duplicate entry: ${dupMsg} already exists.`, 'error');
    return ok;
  }

  submitForm() {
    if (!this.validate()) return;

    let count = 0;
    this.rows.forEach((row) => {
      this.savedRecs.push({
        doc: row.doc,
        svc: row.svc,
        vnd: row.vnd,
        init: row.initiator.selected?.name || '—',
        apr1: row.approver1.selected?.name || '—',
        apr2: row.approver2.selected?.name || '—',
        final: row.finalApprover.selected?.name || '—',
        ts: new Date().toLocaleString('en-IN'),
      });
      count++;
    });

    this.rows = [];
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
