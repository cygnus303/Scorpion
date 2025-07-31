import { Component } from '@angular/core';
import { DocketService } from '../../../shared/services/docket.service';

@Component({
  selector: 'basic-details',
  standalone: false,
  templateUrl: './basic-details.component.html',
  styleUrl: './basic-details.component.scss'
})
export class BasicDetailsComponent {
constructor(public docketService:DocketService){}
}
