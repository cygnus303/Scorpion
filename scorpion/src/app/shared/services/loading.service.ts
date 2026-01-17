import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

private pendingCount = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
 
  loading$ = this.loadingSubject.asObservable();
 
  start() {
    this.pendingCount++;
    this.loadingSubject.next(true);
  }
 
  stop() {
    this.pendingCount = Math.max(0, this.pendingCount - 1);
    this.loadingSubject.next(this.pendingCount > 0);
  }
}
