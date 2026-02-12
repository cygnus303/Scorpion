import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { Router } from '@angular/router';

@Component({
  selector: 'app-acknowledge-fmdocuments-list',
  standalone: true,
  imports: [CommonModule , NgSelectModule],
  templateUrl: './acknowledge-fmdocuments-list.component.html',
  styleUrl: './acknowledge-fmdocuments-list.component.scss'
})
export class AcknowledgeFmdocumentsListComponent {
 constructor(private router: Router) { }
 goToBackList() {
    this.router.navigate(['/Document/AcknowledgeFMDocumentsQuery']);
  }
}
