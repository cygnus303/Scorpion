import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { VendorLayoutService } from '../vendor-layout.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vendor-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './vendor-sidebar.component.html',
  styleUrl: './vendor-sidebar.component.scss'
})
export class VendorSidebarComponent implements OnInit, OnDestroy {
  
  currentUrl: string = '';
  source: string = '';
  isCollapsed: boolean = false;
  private sub: Subscription | undefined;

  constructor(private router: Router, public layoutService: VendorLayoutService) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
      const urlTree = this.router.parseUrl(this.router.url);
      if (urlTree.queryParams['source']) {
        this.source = urlTree.queryParams['source'];
      } else {
        this.source = '';
      }
    });
  }

  ngOnInit() {
    this.sub = this.layoutService.isSidebarCollapsed$.subscribe(val => {
      this.isCollapsed = val;
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  isActive(path: string): boolean {
    const urlTree = this.router.parseUrl(this.currentUrl);
    const urlPath = urlTree.root.children['primary']?.segments.map(it => it.path).join('/') || '';

    if (urlPath.includes(path)) {
      return true;
    }

    if (urlPath.includes('unbilled-detail') && this.source === path) {
      return true;
    }

    if (urlPath.includes('provisional-bills') && this.source === path) {
      return true;
    }

    return false;
  }
}
