import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CommonService } from 'app/shared/services/common.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({
  selector: 'app-acknowledge-fmdocuments',
  standalone: true,
  imports: [CommonModule, NgSelectModule, BsDatepickerModule, ReactiveFormsModule],
  templateUrl: './acknowledge-fmdocuments.component.html',
  styleUrl: './acknowledge-fmdocuments.component.scss'
})
export class AcknowledgeFMDocumentsComponent {
  public acknowledgefilterForm!: FormGroup;
  public DocTypelist = [
    { text: "Bill", value: "2" },
    { text: "COD/DOD", value: "4" },
    { text: "POD", value: "1" },
    { text: "THC", value: "6" },
  ];
  public DocToList = [
    { text: "Customer", value: "1" },
    { text: "Location", value: "2" },
  ];
  
  constructor(private router: Router, public commonService: CommonService) { }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    const endDate = new Date(); // aaje ni date
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29);
    this.acknowledgefilterForm = new FormGroup({
      FMType: new FormControl(null, [Validators.required]),
      Loccode: new FormControl(null, [Validators.required]),
      FmNo: new FormControl(null),
      dateRange: new FormControl([startDate, endDate])
    })
  }

  goToForwardList() {
    if (this.acknowledgefilterForm.valid) {
      this.router.navigate(['/Document/ForwardFMAckDocuments'], { state: { filterData: this.acknowledgefilterForm.value } });
    } else {
      this.acknowledgefilterForm.markAllAsTouched();
    }
  }
}
