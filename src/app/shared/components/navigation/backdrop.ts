import { Component, inject } from '@angular/core';
import { SidebarStore } from './sidebar-store';

@Component({
  selector: 'app-backdrop',
  imports: [],
  template: `
    @if (isMobileOpen()) {
      <div class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"></div>
    }
  `,
  host: {
    '(click)': 'closeSidebar()',
  },
})
export class Backdrop {
  protected sidebarStore = inject(SidebarStore);
  readonly isMobileOpen = this.sidebarStore.isMobileOpen;

  closeSidebar() {
    this.sidebarStore.setMobileOpen(false);
  }
}
