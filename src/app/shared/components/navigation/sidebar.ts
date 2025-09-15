import { Component, inject } from '@angular/core';
import { SidebarStore } from './sidebar-store';

@Component({
  selector: 'app-sidebar',
  imports: [],
  template: `
    <aside
      class="fixed flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200"
      [class.w-[290px]]="isExpanded() || isHovered()"
      [class.w-[90px]]="!(isExpanded() || isHovered())"
      [class.translate-x-0]="isMobileOpen()"
      [class.-translate-x-full]="!isMobileOpen()"
      [class.xl:translate-x-0]="true"
    >
      <div
        class="py-8 flex"
        [class.xl:justify-center]="!(isExpanded() || isHovered())"
        [class.justify-start]="isExpanded() || isHovered()"
      >
        <a routerLink="/">
          @if (isExpanded() || isHovered() || isMobileOpen()) {
            <span class="font-bold text-2xl dark:text-white">ESQUIRE</span>
          } @else {
            <img src="/images/logo/logo-icon.svg" alt="Logo" width="32" height="32" />
          }
        </a>
      </div>
    </aside>
  `,
  host: {
    '(mouseenter)': 'onSidebarMouseEnter()',
    '(mouseleave)': 'sidebarStore.setHovered(false)',
  },
})
export class Sidebar {
  protected sidebarStore = inject(SidebarStore);

  readonly isExpanded = this.sidebarStore.isExpanded;
  readonly isHovered = this.sidebarStore.isHovered;
  readonly isMobileOpen = this.sidebarStore.isMobileOpen;

  onSidebarMouseEnter() {
    if (!this.isExpanded()) {
      this.sidebarStore.setHovered(true);
    }
  }
}
