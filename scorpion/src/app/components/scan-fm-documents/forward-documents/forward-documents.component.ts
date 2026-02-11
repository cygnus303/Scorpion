import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forward-documents',
  standalone: true,
  imports:[CommonModule,RouterModule],
  templateUrl: './forward-documents.component.html',
  styleUrl: './forward-documents.component.scss'
})
export class ForwardDocumentsComponent {

}
