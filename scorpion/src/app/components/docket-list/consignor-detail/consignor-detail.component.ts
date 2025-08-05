import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';
import { BasicDetailService } from '../../../shared/services/basic-detail.service';

@Component({
  selector: 'consignor-detail',
  standalone: false,
  templateUrl: './consignor-detail.component.html',
  styleUrl: './consignor-detail.component.scss'
})
export class ConsignorDetailComponent {
  constructor(
    public docketService: DocketService,
    private basicDetailService: BasicDetailService) {}

  ngOnInit() {
    this.docketService.consignorbuild();
  }
}
