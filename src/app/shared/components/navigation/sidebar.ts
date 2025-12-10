import { ChangeDetectorRef, Component, computed, effect, inject } from '@angular/core';
import { NavItem, SidebarStore } from './sidebar-store';
import { SafeHtmlPipe } from '../../pipe/safe-html-pipe';
import { Router, Event, RouterModule, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserRole } from '../../../settings/users/user-resource';
import { AuthRoleService } from '../../../settings/users/auth-role-service';

@Component({
  selector: 'app-sidebar',
  imports: [SafeHtmlPipe, RouterModule],
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
      <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav class="mb-6">
          <div class="flex flex-col gap-4">
            <!-- Menu Section -->
            <div>
              <h2
                class="mb-4 text-xs uppercase flex leading-[20px] text-gray-400"
                [class]="{
                  'xl:justify-center': !(isExpanded() || isHovered()),
                  'justify-start': isExpanded() || isHovered(),
                }"
              >
                @if (isExpanded() || isHovered() || isMobileOpen()) {
                  Menu
                } @else {
                  <svg
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-6"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M5.99915 10.2451C6.96564 10.2451 7.74915 11.0286 7.74915 11.9951V12.0051C7.74915 12.9716 6.96564 13.7551 5.99915 13.7551C5.03265 13.7551 4.24915 12.9716 4.24915 12.0051V11.9951C4.24915 11.0286 5.03265 10.2451 5.99915 10.2451ZM17.9991 10.2451C18.9656 10.2451 19.7491 11.0286 19.7491 11.9951V12.0051C19.7491 12.9716 18.9656 13.7551 17.9991 13.7551C17.0326 13.7551 16.2491 12.9716 16.2491 12.0051V11.9951C16.2491 11.0286 17.0326 10.2451 17.9991 10.2451ZM13.7491 11.9951C13.7491 11.0286 12.9656 10.2451 11.9991 10.2451C11.0326 10.2451 10.2491 11.0286 10.2491 11.9951V12.0051C10.2491 12.9716 11.0326 13.7551 11.9991 13.7551C12.9656 13.7551 13.7491 12.9716 13.7491 12.0051V11.9951Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                }
              </h2>
              <ul class="flex flex-col gap-1">
                @for (nav of navItems(); track $index; let i = $index) {
                  <li>
                    @if (nav.subItems) {
                      <button
                        (click)="toggleSubmenu('main', i)"
                        class="menu-item group cursor-pointer"
                        [class.menu-item-active]="openSubmenu === 'main-' + i"
                        [class.menu-item-inactive]="openSubmenu !== 'main-' + i"
                        [class]="{
                          'xl:justify-center': !(isExpanded() || isHovered()),
                          'xl:justify-start': isExpanded() || isHovered(),
                        }"
                      >
                        <span
                          class="menu-item-icon-size"
                          [class.menu-item-icon-active]="openSubmenu === 'main-' + i"
                          [class.menu-item-icon-inactive]="openSubmenu !== 'main-' + i"
                          [innerHTML]="nav.icon | appSafeHtml"
                        >
                        </span>
                        @if (isExpanded() || isHovered() || isMobileOpen()) {
                          <span class="menu-item-text">
                            {{ nav.name }}
                          </span>
                        }
                        @if (nav.new && (isExpanded() || isHovered() || isMobileOpen())) {
                          <span
                            class="ml-auto absolute right-10 menu-dropdown-badge"
                            [class]="{
                              'menu-dropdown-badge-active': openSubmenu === 'main-' + i,
                              'menu-dropdown-badge-inactive': openSubmenu !== 'main-' + i,
                            }"
                          >
                            new
                          </span>
                        }
                        @if (isExpanded() || isHovered() || isMobileOpen()) {
                          <svg
                            [class]="openSubmenu === 'main-' + i ? 'rotate-180 text-brand-500' : ''"
                            width="1em"
                            height="1em"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            class="ml-auto w-5 h-5 transition-transform duration-200"
                          >
                            <path
                              d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                              stroke="currentColor"
                              stroke-width="1.5"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            ></path>
                          </svg>
                        }
                      </button>
                      <div
                        class="overflow-hidden transition-all duration-300"
                        [id]="'main-' + i"
                        [style.display]="
                          isExpanded() || isHovered() || isMobileOpen() ? 'block' : 'none'
                        "
                        [style]="{
                          height:
                            openSubmenu === 'main-' + i
                              ? (subMenuHeights['main-' + i] || 0) + 'px'
                              : '0px',
                        }"
                      >
                        <ul class="mt-2 space-y-1 ml-9">
                          @for (subItem of nav.subItems; track $index) {
                            <li>
                              <a
                                [routerLink]="subItem.path"
                                routerLinkActive=""
                                (click)="onSubmenuClick()"
                                class="menu-dropdown-item"
                                [class]="{
                                  'menu-dropdown-item-inactive': !isActive(subItem.path),
                                  'menu-dropdown-item-active': isActive(subItem.path),
                                }"
                              >
                                {{ subItem.name }}
                                <span class="flex items-center gap-1 ml-auto">
                                  @if (subItem.new) {
                                    <span
                                      class="menu-dropdown-badge"
                                      [class]="{
                                        'menu-dropdown-badge-active': isActive(subItem.path),
                                        'menu-dropdown-badge-inactive': !isActive(subItem.path),
                                      }"
                                    >
                                      new
                                    </span>
                                  }
                                  @if (subItem.pro) {
                                    <span
                                      class="ml-auto menu-dropdown-badge-pro"
                                      [class]="{
                                        'menu-dropdown-badge-pro-active': isActive(subItem.path),
                                        'menu-dropdown-badge-pro-inactive': !isActive(subItem.path),
                                      }"
                                    >
                                      pro
                                    </span>
                                  }
                                </span>
                              </a>
                            </li>
                          }
                        </ul>
                      </div>
                    } @else {
                      @if (nav.path) {
                        <a
                          [routerLink]="nav.path"
                          routerLinkActive="menu-item-active"
                          class="menu-item group"
                          [class]="{ 'menu-item-inactive': !isActive(nav.path) }"
                          (click)="onSubmenuClick()"
                        >
                          <span
                            class="menu-item-icon-size"
                            [class]="{
                              'menu-item-icon-active': isActive(nav.path),
                              'menu-item-icon-inactive': !isActive(nav.path),
                            }"
                            [innerHTML]="nav.icon | appSafeHtml"
                          >
                          </span>
                          <span class="menu-item-text">
                            @if (isExpanded() || isHovered() || isMobileOpen()) {
                              {{ nav.name }}
                            }
                          </span>
                        </a>
                      }
                    }
                  </li>
                }
              </ul>
            </div>
            <!-- end main menu -->
          </div>
        </nav>
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
  protected router = inject(Router);
  protected cdr = inject(ChangeDetectorRef);
  protected roleService = inject(AuthRoleService);

  readonly isExpanded = this.sidebarStore.isExpanded;
  readonly isHovered = this.sidebarStore.isHovered;
  readonly isMobileOpen = this.sidebarStore.isMobileOpen;

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.setActiveMenuFromRoute(event.url);
      }
    });
    effect(() => {
      this.setActiveMenuFromRoute(this.router.url);
    });
  }

  onSidebarMouseEnter() {
    if (!this.isExpanded()) {
      this.sidebarStore.setHovered(true);
    }
  }

  navItems = computed(() =>
    this.filterNavItems(this.sidebarStore.sidebarItems, this.roleService.roles()),
  );

  openSubmenu: string | null | number = null;
  subMenuHeights: Record<string, number> = {};

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [{ items: this.navItems(), prefix: 'main' }];

    menuGroups.forEach((group) => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (currentUrl === subItem.path) {
              const key = `${group.prefix}-${i}`;
              this.openSubmenu = key;

              setTimeout(() => {
                const el = document.getElementById(key);
                if (el) {
                  this.subMenuHeights[key] = el.scrollHeight;
                  this.cdr.detectChanges(); // Ensure UI updates
                }
              });
            }
          });
        }
      });
    });
  }

  private filterNavItems(items: NavItem[], userRoles: UserRole[]): NavItem[] {
    return items
      .map((item) => {
        const parentAllowed =
          item.allowedRoles.length === 0 ||
          item.allowedRoles.some((role) => userRoles.includes(role));

        // If item has subItems → filter them
        if (item.subItems && item.subItems.length > 0) {
          const filteredSubItems = item.subItems.filter((sub) => {
            return (
              sub.allowedRoles.length === 0 ||
              sub.allowedRoles.some((role) => userRoles.includes(role))
            );
          });

          if (filteredSubItems.length > 0) {
            return { ...item, subItems: filteredSubItems };
          }

          // No subItems allowed → keep parent only if allowed
          return parentAllowed ? { ...item, subItems: [] } : null;
        }

        return parentAllowed ? item : null;
      })
      .filter((i): i is NavItem => i !== null);
  }

  onSubmenuClick() {
    if (this.isMobileOpen()) {
      this.sidebarStore.setMobileOpen(false);
    }
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights[key] = 0;
    } else {
      this.openSubmenu = key;

      setTimeout(() => {
        const el = document.getElementById(key);
        if (el) {
          this.subMenuHeights[key] = el.scrollHeight;
          this.cdr.detectChanges(); // Ensure UI updates
        }
      });
    }
  }
}
