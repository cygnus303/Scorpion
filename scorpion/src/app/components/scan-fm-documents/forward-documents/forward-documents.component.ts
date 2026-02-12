import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forward-documents',
  standalone: true,
  imports: [CommonModule , NgSelectModule],
  templateUrl: './forward-documents.component.html',
  styleUrl: './forward-documents.component.scss'
})
export class ForwardDocumentsComponent {
  constructor(private router: Router) { }
  goToForwardList() {
    this.router.navigate(['/Document/ForwardFMDocuments']);
  }
}
