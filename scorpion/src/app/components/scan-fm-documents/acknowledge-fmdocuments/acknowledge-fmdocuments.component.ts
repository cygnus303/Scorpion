import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acknowledge-fmdocuments',
  standalone: true,
  imports: [CommonModule , NgSelectModule],
  templateUrl: './acknowledge-fmdocuments.component.html',
  styleUrl: './acknowledge-fmdocuments.component.scss'
})
export class AcknowledgeFMDocumentsComponent {
 constructor(private router: Router) { }
 goToForwardList() {
    this.router.navigate(['/Document/ForwardFMAckDocuments']);
  }
}
