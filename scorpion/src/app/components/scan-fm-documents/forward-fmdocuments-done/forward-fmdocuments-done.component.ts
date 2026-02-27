import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forward-fmdocuments-done',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './forward-fmdocuments-done.component.html',
  styleUrl: './forward-fmdocuments-done.component.scss'
})
export class ForwardFMDocumentsDoneComponent {
  fmNo: string | null = '';
  fmType: string | null = '';
  type: string | null = '';
  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.fmNo = params['fmNo'];
      this.fmType = params['fmType'];
      this.type = params['Type'];
      console.log(this.fmNo, this.fmType, this.type); // Just to check if params are received
    });
  }
}
