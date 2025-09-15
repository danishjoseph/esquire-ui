import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarStore } from './sidebar-store';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Backdrop } from './backdrop';

@Component({
  selector: 'app-layout',
  imports: [RouterModule, Sidebar, Header, Backdrop],
  template: `<div class="min-h-screen xl:flex">
    <div>
      <app-sidebar />
      <app-backdrop />
    </div>
    <div
      class="flex-1 transition-all duration-300 ease-in-out"
      [class.xl:ml-[290px]]="isExpanded() || isHovered()"
      [class.xl:ml-[90px]]="!isExpanded() && !isHovered()"
      [class.ml-0]="isMobileOpen()"
    >
      <!-- app header start -->
      <app-header />
      <!-- app header end -->
      <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <router-outlet />
      </div>
    </div>
  </div>`,
})
export class Layout {
  private readonly sidebarStore = inject(SidebarStore);

  readonly isExpanded = this.sidebarStore.isExpanded;
  readonly isHovered = this.sidebarStore.isHovered;
  readonly isMobileOpen = this.sidebarStore.isMobileOpen;
}
