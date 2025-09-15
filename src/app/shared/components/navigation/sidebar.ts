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
      icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-gray-800 size-6 dark:text-white/90"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.80443 5.60156C7.59109 5.60156 6.60749 6.58517 6.60749 7.79851C6.60749 9.01185 7.59109 9.99545 8.80443 9.99545C10.0178 9.99545 11.0014 9.01185 11.0014 7.79851C11.0014 6.58517 10.0178 5.60156 8.80443 5.60156ZM5.10749 7.79851C5.10749 5.75674 6.76267 4.10156 8.80443 4.10156C10.8462 4.10156 12.5014 5.75674 12.5014 7.79851C12.5014 9.84027 10.8462 11.4955 8.80443 11.4955C6.76267 11.4955 5.10749 9.84027 5.10749 7.79851ZM4.86252 15.3208C4.08769 16.0881 3.70377 17.0608 3.51705 17.8611C3.48384 18.0034 3.5211 18.1175 3.60712 18.2112C3.70161 18.3141 3.86659 18.3987 4.07591 18.3987H13.4249C13.6343 18.3987 13.7992 18.3141 13.8937 18.2112C13.9797 18.1175 14.017 18.0034 13.9838 17.8611C13.7971 17.0608 13.4132 16.0881 12.6383 15.3208C11.8821 14.572 10.6899 13.955 8.75042 13.955C6.81096 13.955 5.61877 14.572 4.86252 15.3208ZM3.8071 14.2549C4.87163 13.2009 6.45602 12.455 8.75042 12.455C11.0448 12.455 12.6292 13.2009 13.6937 14.2549C14.7397 15.2906 15.2207 16.5607 15.4446 17.5202C15.7658 18.8971 14.6071 19.8987 13.4249 19.8987H4.07591C2.89369 19.8987 1.73504 18.8971 2.05628 17.5202C2.28015 16.5607 2.76117 15.2906 3.8071 14.2549ZM15.3042 11.4955C14.4702 11.4955 13.7006 11.2193 13.0821 10.7533C13.3742 10.3314 13.6054 9.86419 13.7632 9.36432C14.1597 9.75463 14.7039 9.99545 15.3042 9.99545C16.5176 9.99545 17.5012 9.01185 17.5012 7.79851C17.5012 6.58517 16.5176 5.60156 15.3042 5.60156C14.7039 5.60156 14.1597 5.84239 13.7632 6.23271C13.6054 5.73284 13.3741 5.26561 13.082 4.84371C13.7006 4.37777 14.4702 4.10156 15.3042 4.10156C17.346 4.10156 19.0012 5.75674 19.0012 7.79851C19.0012 9.84027 17.346 11.4955 15.3042 11.4955ZM19.9248 19.8987H16.3901C16.7014 19.4736 16.9159 18.969 16.9827 18.3987H19.9248C20.1341 18.3987 20.2991 18.3141 20.3936 18.2112C20.4796 18.1175 20.5169 18.0034 20.4837 17.861C20.2969 17.0607 19.913 16.088 19.1382 15.3208C18.4047 14.5945 17.261 13.9921 15.4231 13.9566C15.2232 13.6945 14.9995 13.437 14.7491 13.1891C14.5144 12.9566 14.262 12.7384 13.9916 12.5362C14.3853 12.4831 14.8044 12.4549 15.2503 12.4549C17.5447 12.4549 19.1291 13.2008 20.1936 14.2549C21.2395 15.2906 21.7206 16.5607 21.9444 17.5202C22.2657 18.8971 21.107 19.8987 19.9248 19.8987Z" fill="currentColor"></path></svg>`,
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
