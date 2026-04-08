import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { THCMasterService } from 'app/shared/services/thc-master.service';

@Component({
  selector: 'app-thc-departure',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,NgSelectModule],
  templateUrl: './thc-departure.component.html',
  styleUrl: './thc-departure.component.scss'
})
export class ThcDepartureComponent {

  constructor(private thcmasterService:THCMasterService){}

  onsubmit(){
    const payload={

    }
    // this.thcmasterService.submitTHCDeparture(payload).subscribe({
    //     next:(res)=>{
    //       console.log(res);
    //     }
    // })
  }

}
