import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';
 
function startApp() {
  bootstrapApplication(AppComponent, {
    providers: [
      provideAnimations(),
      provideRouter(routes),
      provideHttpClient()
    ]
  });
}
 
// ✅ Only Prod ma API call
if (environment.env === 'Prod' || environment.env === 'Dev' || environment.env === 'UAT') {
 
  fetch(environment.apiUrl + 'THC/GetGeneralMasterDetails?codeType=Link')
    .then(res => res.json())
    .then(data => {
      if (data.success && data.data?.length > 0) {
        environment.liveUrl = data.data[0].codeDesc;
        console.log('Prod Live URL Loaded:', environment.liveUrl);
      }
    })
    .catch(err => {
      console.error('Failed to load liveUrl', err);
    })
    .finally(() => {
      startApp();
    });
 
} else {
  // Dev / UAT direct start
  startApp();
}
 