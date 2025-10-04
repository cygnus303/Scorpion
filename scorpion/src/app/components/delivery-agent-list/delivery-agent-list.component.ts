import { Component, ViewChild } from '@angular/core';
import { DeliveryAgentModalComponent } from './delivery-agent-modal/delivery-agent-modal.component';
import { DeliveryAgentViewComponent } from './delivery-agent-view/delivery-agent-view.component';
import { DeliveryAgentService } from 'app/shared/services/delivery-agent.service';
import { DeliveryAgentByCodeResponse, DeliveryAgentsListRepsonse } from 'app/shared/models/delivery-agent.model';
import { finalize } from 'rxjs';
import saveAs from 'file-saver';

@Component({
  selector: 'app-delivery-agent-list',
  standalone: false,
  templateUrl: './delivery-agent-list.component.html',
  styleUrl: './delivery-agent-list.component.scss'
})
export class DeliveryAgentListComponent {
  public totalItems!:number;
  public pageNumber:number = 1;
  public pageSize:number = 10;
  public deliveryAgentsList:DeliveryAgentsListRepsonse[]=[]
  public deliveryAgentByCodeList!:DeliveryAgentByCodeResponse;
  public filters: { [key: string]: string } = {}; // Dynamic filter object
  @ViewChild('deliveryAgentPopup') deliveryAgentPopup!: DeliveryAgentModalComponent;
  @ViewChild('deliveryAgentViewPopup') deliveryAgentViewPopup!: DeliveryAgentViewComponent;

  constructor(private deliveryAgentService:DeliveryAgentService){}

  ngOnInit(){
    this.getDeliveryAgentList();
  }

  getDeliveryAgentList(pageNumber: number = 1, pageSize: number = this.pageSize) {
     this.filters = Object.fromEntries(
      Object.entries(this.filters).filter(([key, value]) => value !== null)
    );
    const data ={
      ...this.filters,
      PageNumber:pageNumber,
      PageSize:pageSize
    }
    this.deliveryAgentService.getDeliveryAgent(data).subscribe({next: (response) => {
        if (response) {
          this.deliveryAgentsList = response.data;
          this.totalItems=response.totalRecords
        }
      },
    })
  }

  getDeliveryAgentByCodeList(code: string, callback?: (data: any) => void) {
    this.deliveryAgentService.getDeliveryAgentByCodeList(code).pipe(finalize(() => {
      if (callback) {callback(this.deliveryAgentByCodeList);}
      })).subscribe({next: (response) => {
        if (response) {
          this.deliveryAgentByCodeList = response.data;
        }
      },
      error: (err) => {
        this.deliveryAgentByCodeList = {} as any; // fallback empty object
      }
    });
  }

  deliveryAgentExport() {
    this.deliveryAgentService.deliveryAgentExport().subscribe({next: (blob: Blob) => {
     saveAs(blob, 'DA_Master.xlsx'); 
    },
    error: (err) => console.error('Excel export failed', err)});
  }

  openDeliveryAgentsPopup(code?: any) {
    if (code) {
      this.getDeliveryAgentByCodeList(code, (item) => {
        this.deliveryAgentPopup.showPopup(item);
      });
    } else {
      this.deliveryAgentPopup.showPopup();
    }
  }

  opendeliveryAgentViewPopup(code?: any) {
    if (code) {
      this.getDeliveryAgentByCodeList(code, (item) => {
        this.deliveryAgentViewPopup.showPopup(item)
      });
    }
  }
}
