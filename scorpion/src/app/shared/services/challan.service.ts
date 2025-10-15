import { Injectable } from '@angular/core';
import { BasicDetailService } from './basic-detail.service';
import { generalMasterResponse } from '../models/general-master.model';

@Injectable({
  providedIn: 'root'
})
export class ChallanService {
public vendtyData:generalMasterResponse[]=[]
  constructor(private basicDetailService: BasicDetailService) { }

    getVendtyData() {
    this.basicDetailService.getGeneralMasterList('VENDTY', '', '').subscribe({
      next: (response) => {
        if (response.success) {
          this.vendtyData = response.data;
        }
      },
    });
  }
}
