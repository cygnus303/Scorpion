import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  loading = new BehaviorSubject(false);
  isLoading = this.loading.asObservable();
  activeNavigationUrl = new Subject<string>()
  activemenuRoleList = new BehaviorSubject<any>(null);

  updateLoader(isLoading: boolean) {
    this.loading.next(isLoading);
  }
}
