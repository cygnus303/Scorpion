import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocketService } from 'app/shared/services/docket.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-docket-done',
  standalone: false,
  templateUrl: './docket-done.component.html',
  styleUrl: './docket-done.component.scss'
})
export class DocketDoneComponent {
  env = environment;
  public docketData: any = {};   
  constructor(private route: ActivatedRoute,public docketService: DocketService, private router: Router) {}
  ngOnInit() {
    debugger
    this.docketData = {
      id: this.route.snapshot.paramMap.get('id'),
      dockNo: this.route.snapshot.queryParamMap.get('DOCKNO'),
      isFromBill: this.route.snapshot.queryParamMap.get('IsFromBillGeneration')
    };
  }


  openPrint(dockNo: string) {
  const url = this.env.liveUrl + 'ViewPrint/DocketViewPrint?Type=2&DocketNo=' + dockNo;

   const width = 900;
  const height = 600;

  // Always left-top corner
  const left = 0;
  const top = 10;

  window.open(
    url,
    'PRINT',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
  );
}

barcodePrint(){
 const url = `${this.env.liveUrl}ViewPrint/Barcode_Generation?Dockno=${this.docketData.dockNo}&BarcodeSerial=`;

   const width = 900;
  const height = 600;

  // Always left-top corner
  const left = 0;
  const top = 10;

  window.open(
    url,
    'PRINT',
    `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
  );
}

 addMoreCNote() {
    const data = this.docketService.docketUrl;
    if (data) {
      window.location.href = `/docket?data=${encodeURIComponent(data)}`;
    }
  }

}