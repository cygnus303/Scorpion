import { Injectable, Injector } from '@angular/core';
import { generalMasterResponse } from '../models/general-master.model';
import { BasicDetailService } from './basic-detail.service';
import { DocketService } from './docket.service';

@Injectable({
  providedIn: 'root'
})
export class GeneralMasterService {

 constructor(
     private basicDetailService: BasicDetailService,
     private docketService: DocketService
    ) { }

 
}
