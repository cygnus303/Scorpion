import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonService } from './shared/services/common.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'scorpion';

  public loading: string = 'disable';
  constructor(public commonService: CommonService,public spinner: NgxSpinnerService){
    this.commonService.isLoading.subscribe({
      next: (response) => {
        setTimeout(()=>{
          if (response != null) {
            this.loading = response ? 'enable' : 'disable';
          }
        },500)
      },
      error: (response: any) => {},
    });
  }
}
