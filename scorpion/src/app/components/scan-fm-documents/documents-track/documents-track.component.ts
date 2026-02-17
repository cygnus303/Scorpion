import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-documents-track',
  standalone: true,
  imports: [CommonModule, NgSelectModule, ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './documents-track.component.html',
  styleUrl: './documents-track.component.scss'
})
export class DocumentsTrackComponent {
  public documentsTrackForm!: FormGroup;
  public DocTypelist = [
    { text: "Bill", value: "2" },
    { text: "COD/DOD", value: "4" },
    { text: "POD", value: "1" },
    { text: "THC", value: "6" },
  ];

  ngOnInit() {
    this.documentsTrackForm = new FormGroup({
      docType: new FormControl(null, [Validators.required]),
      DocNo: new FormControl(null, [Validators.required]),
    });
  }

  goToForwardList() {
    if (this.documentsTrackForm.valid) {
    } else {
      this.documentsTrackForm.markAllAsTouched();
    }
  }
}
