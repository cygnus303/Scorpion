import { Component, TemplateRef, ViewChild } from '@angular/core';
import { PRSDRSApiService } from 'app/shared/services/prsdrs-api.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'environments/environment';
import { CommonModule } from '@angular/common';
import { HccViewComponent } from 'app/components/hcc-view/hcc-view.component';


@Component({
  selector: 'app-mf-view',
  standalone: true,
  imports: [CommonModule,HccViewComponent],
   providers: [BsModalService],
  templateUrl: './mf-view.component.html',
  styleUrl: './mf-view.component.scss'
})
export class MfViewComponent {
  public modalRef!: BsModalRef;
  public isLoading:boolean=false;
  public viewDetail:any;
  public env = environment;
    @ViewChild('HccViewComponent') HccViewComponent!: HccViewComponent;
  @ViewChild('Templatepod', { static: true }) Templatepod!: TemplateRef<any>;
  
  constructor(
    private modalService: BsModalService,
    private prsdrsAPIService: PRSDRSApiService
  ) { }

  showPopup(thcNo:string){
    this.getMFViewData(thcNo);
      this.modalRef = this.modalService.show(this.Templatepod, { class: 'modal-xl modal-dialog-centered', backdrop: true });
  }

  getMFViewData(ThcNo: any) {
    this.isLoading = true;
    this.prsdrsAPIService.onMFDetail(ThcNo).subscribe((res: any) => {
      this.isLoading = false;
      if (res) {
        console.log("HCC View Data:", res);
        this.viewDetail = res.data;
      }
    }, () => {
      this.isLoading = false;
    });
  }

  openMFView(MFNO:string){
     const url = `${this.env.liveUrl}ViewPrint/ViewMF?MFNO=${MFNO}&src=angular`;
    const popup = window.open('', 'popupWindow',
      'width=900,height=600,top=100,left=200,resizable=yes,scrollbars=yes'
    );
    if (popup) {
      popup.location.href = url;
    }
  }

    openHccView(data: any, chargeType: string) {
    this.HccViewComponent.showPopup(data, chargeType, 'M');
  }
}
