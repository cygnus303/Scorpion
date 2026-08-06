import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-approver-master',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './approver-master.component.html',
  styleUrl: './approver-master.component.scss'
})
export class ApproverMasterComponent {
}
