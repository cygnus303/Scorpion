import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonService } from './shared/services/services/common.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'scorpion';

  public loading: string = 'disable';
  constructor(public commonService: CommonService){
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
