import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorLayoutService {
  private isSidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  isSidebarCollapsed$ = this.isSidebarCollapsedSubject.asObservable();

  toggleSidebar() {
    const newState = !this.isSidebarCollapsedSubject.value;
    console.log('Toggling sidebar to:', newState);
    this.isSidebarCollapsedSubject.next(newState);
  }

  setSidebarCollapsed(collapsed: boolean) {
    this.isSidebarCollapsedSubject.next(collapsed);
  }
}
