import { ChangeDetectorRef, Component, effect, inject } from '@angular/core';
import { SidebarStore } from './sidebar-store';
import { SafeHtmlPipe } from '../../pipe/safe-html-pipe';
import { Router, Event, RouterModule, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface NavItem {
  name: string;
  icon: string;
  path?: string;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
}

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
                @for (nav of navItems; track $index; let i = $index) {
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

  navItems: NavItem[] = [
    {
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z" fill="currentColor"></path></svg>`,
      name: 'Dashboard',
      path: '/dashboard',
    },
    {
      name: 'Customers',
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="currentColor"></path></svg>`,
      path: '/customers',
    },
    {
      name: 'Products',
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.665 3.75618C11.8762 3.65061 12.1247 3.65061 12.3358 3.75618L18.7807 6.97853L12.3358 10.2009C12.1247 10.3064 11.8762 10.3064 11.665 10.2009L5.22014 6.97853L11.665 3.75618ZM4.29297 8.19199V16.0946C4.29297 16.3787 4.45347 16.6384 4.70757 16.7654L11.25 20.0365V11.6512C11.1631 11.6205 11.0777 11.5843 10.9942 11.5425L4.29297 8.19199ZM12.75 20.037L19.2933 16.7654C19.5474 16.6384 19.7079 16.3787 19.7079 16.0946V8.19199L13.0066 11.5425C12.9229 11.5844 12.8372 11.6207 12.75 11.6515V20.037ZM13.0066 2.41453C12.3732 2.09783 11.6277 2.09783 10.9942 2.41453L4.03676 5.89316C3.27449 6.27429 2.79297 7.05339 2.79297 7.90563V16.0946C2.79297 16.9468 3.27448 17.7259 4.03676 18.1071L10.9942 21.5857L11.3296 20.9149L10.9942 21.5857C11.6277 21.9024 12.3732 21.9024 13.0066 21.5857L19.9641 18.1071C20.7264 17.7259 21.2079 16.9468 21.2079 16.0946V7.90563C21.2079 7.05339 20.7264 6.27429 19.9641 5.89316L13.0066 2.41453Z" fill="currentColor"></path></svg>`,
      path: '/products',
    },
    {
      name: 'Service Management',
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V18.5C20.75 19.7426 19.7426 20.75 18.5 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5V8.58325L19.25 8.58325V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H5.5ZM19.25 10.0833H15.416V13.9165H19.25V10.0833ZM13.916 10.0833L10.083 10.0833V13.9165L13.916 13.9165V10.0833ZM8.58301 10.0833H4.75V13.9165H8.58301V10.0833ZM4.75 18.5V15.4165H8.58301V19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5ZM10.083 19.25V15.4165L13.916 15.4165V19.25H10.083ZM15.416 19.25V15.4165H19.25V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15.416Z" fill="currentColor"></path></svg>`,
      subItems: [{ name: 'Service Tickets', path: '/tickets' }],
    },
  ];

  openSubmenu: string | null | number = null;
  subMenuHeights: Record<string, number> = {};

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [{ items: this.navItems, prefix: 'main' }];

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

  onSubmenuClick() {
    console.log('click submenu');
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
