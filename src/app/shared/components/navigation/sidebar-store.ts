import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarStore {
  #isExpanded = signal(true);
  #isMobileOpen = signal(false);
  #isHovered = signal(false);

  readonly isExpanded = this.#isExpanded.asReadonly();
  readonly isMobileOpen = this.#isMobileOpen.asReadonly();
  readonly isHovered = this.#isHovered.asReadonly();

  setExpanded(val: boolean) {
    this.#isExpanded.set(val);
  }

  toggleExpanded() {
    this.#isExpanded.set(!this.#isExpanded());
  }

  setMobileOpen(val: boolean) {
    this.#isMobileOpen.set(val);
  }

  toggleMobileOpen() {
    this.#isMobileOpen.set(!this.#isMobileOpen());
  }

  setHovered(val: boolean) {
    this.#isHovered.set(val);
  }
}
