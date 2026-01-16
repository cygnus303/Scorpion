import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
 
@Injectable({ providedIn: 'root' })
export class UrlIntegrityGuard implements CanActivate {
 
  constructor(private router: Router) {}
 
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
 
    const lastValidUrl = sessionStorage.getItem('lastValidUrl');
    const currentUrl = state.url;
 
    // First time load → allow & store
    if (!lastValidUrl) {
      sessionStorage.setItem('lastValidUrl', currentUrl);
      return true;
    }
 
    // If user manually edited URL
    if (currentUrl !== lastValidUrl) {
      this.router.navigateByUrl(lastValidUrl);
      return false;
    }
 
    return true;
  }
}