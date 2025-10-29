import {
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  inject,
  model,
  signal,
} from '@angular/core';
import { Badge, BadgeColor } from '../../shared/components/ui/badge';
import { Dropdown } from '../../shared/components/ui/dropdown';
import { PageBreadcrumb } from '../../shared/components/ui/page-breadcrumb';
import { AvatarText } from '../../shared/components/avatar/avatar-text';
import { DatePipe, KeyValue } from '@angular/common';
import { TabGroup } from '../../shared/components/ui/tab-group';
import { WorklogStatistics } from './worklog-statistics';
import { Card } from '../../shared/components/cards/card';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TicketResource, TicketStatus, TicketTable } from './ticket-resource';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { debounceTime, map } from 'rxjs';
import { TicketModal } from './ticket-modal';
import { ServiceSectionName } from './ticket-form-service';
import { ReplyType } from './ticket-reply';

export const routeToStatusMap: Record<string, TicketStatus> = {
  'in-progress': TicketStatus.IN_PROGRESS,
  qc: TicketStatus.QC,
  'delivery-ready': TicketStatus.DELIVERY_READY,
  delivered: TicketStatus.DELIVERED,
  closed: TicketStatus.CLOSED,
};

export const statusToRouteMap: Record<TicketStatus, string> = {
  [TicketStatus.IN_PROGRESS]: 'in-progress',
  [TicketStatus.QC]: 'qc',
  [TicketStatus.DELIVERY_READY]: 'delivery-ready',
  [TicketStatus.DELIVERED]: 'delivered',
  [TicketStatus.CLOSED]: 'closed',
};

@Component({
  selector: 'app-ticket-list',
  imports: [
    Badge,
    Dropdown,
    TabGroup,
    PageBreadcrumb,
    AvatarText,
    WorklogStatistics,
    Card,
    DatePipe,
    TicketModal,
  ],
  template: `
    <app-page-breadcrumb pageTitle="Support Tickets" />
    <app-worklog-statistics />
    <app-card title="Support Tickets">
      <div card-actions class="flex flex-wrap overflow-x-auto w-full">
        <app-tab-group [options]="ticketStatusOptions" [(selected)]="selectedTab" />
      </div>
      <div class="overflow-x-auto custom-scrollbar">
        @if (resource.hasValue() && resource.value().services.length) {
          <div class="overflow-y-auto h-[50vh]">
            <table class="w-full table-auto">
              <thead
                class=" sticky top-0 px-6 py-3.5 border-t border-gray-100 border-y bg-gray-50 dark:border-white/[0.05] dark:bg-gray-900"
              >
                <tr>
                  <th
                    class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400 hidden sm:table-cell"
                  >
                    Case ID
                  </th>
                  <th
                    class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Customer
                  </th>
                  <th
                    class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400 hidden sm:table-cell"
                  >
                    Created At
                  </th>
                  <th
                    class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    Assigned Section
                  </th>
                  <th
                    class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400 hidden sm:table-cell"
                  >
                    Last Update By
                  </th>
                  <th
                    class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
                  >
                    <span class="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
                @for (item of tickets(); track $index) {
                  <tr>
                    <td
                      class="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400 hidden sm:table-cell"
                    >
                      {{ item.caseId }}
                    </td>
                    <td class="px-4 sm:px-6 py-3.5">
                      <div class="flex items-center gap-3">
                        <app-avatar-text [name]="item.purchase.customer.name" class="w-10 h-10" />
                        <div>
                          <span
                            class="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400"
                          >
                            {{ item.purchase.customer.name }}
                          </span>
                          <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                            {{ item.purchase.customer.mobile }}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td
                      class="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400 hidden sm:table-cell"
                    >
                      {{ item.createdAt | date: 'short' }}
                    </td>
                    <td class="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      <app-badge
                        size="sm"
                        [color]="
                          item.serviceSection && item.serviceSection.name
                            ? serviceSectionInfoMap[item.serviceSection.name].color
                            : 'light'
                        "
                      >
                        {{
                          item.serviceSection && item.serviceSection.name
                            ? serviceSectionInfoMap[item.serviceSection.name].label
                            : '-'
                        }}
                      </app-badge>
                    </td>
                    <td
                      class="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400 hidden sm:table-cell"
                    >
                      {{ item.updated_by?.name ?? '-' }}
                    </td>
                    <td class="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                      <app-dropdown class="relative" className="absolute right-0 z-10 w-40">
                        <div dropdown-button>
                          <button class="text-gray-500 dark:text-gray-400">
                            <svg
                              class="fill-current"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
                                fill=""
                              />
                            </svg>
                          </button>
                        </div>
                        <div dropdown-content>
                          <button
                            class="text-sm flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            (click)="handleViewMore(item)"
                          >
                            View More
                          </button>
                          @if (item.status === TICKET_STATUS.IN_PROGRESS) {
                            <button
                              class="text-sm flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                              (click)="handleUpdateSection(item)"
                            >
                              Update Section
                            </button>
                          }
                          @if (item.status !== TICKET_STATUS.CLOSED) {
                            <button
                              class="text-sm flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                              (click)="handleUpdate(item)"
                            >
                              Update Status
                            </button>
                          }
                        </div>
                      </app-dropdown>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="h-[50vh] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No rows to display.
          </div>
        }
      </div>
    </app-card>
    <app-ticket-modal [ticketId]="ticketId()" [isOpen]="isOpen()" (closed)="closeModal()" />
  `,
})
export class TicketList {
  protected ticketId = model('');
  protected isOpen = signal(false);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected destroyRef = inject(DestroyRef);
  protected ticketResource = inject(TicketResource);
  readonly selectedTab = model(TicketStatus.IN_PROGRESS);
  protected TICKET_STATUS = TicketStatus;

  #limit = 10;

  protected search$ = new FormControl('', { nonNullable: true });
  protected search = toSignal(this.search$.valueChanges.pipe(debounceTime(500)), {
    initialValue: '',
  });

  constructor() {
    toSignal(
      this.route.params.pipe(
        takeUntilDestroyed(this.destroyRef),
        map((params: Params) => {
          const routeStatus = params['status'];
          const mappedStatus = routeToStatusMap[routeStatus];
          if (mappedStatus && Object.values(TicketStatus).includes(mappedStatus)) {
            this.selectedTab.set(mappedStatus || TicketStatus.IN_PROGRESS);
          }
        }),
      ),
      { initialValue: null },
    );

    afterRenderEffect(() => {
      const status = this.selectedTab();
      const routeParam = this.route.snapshot.params['status'];
      const newRouteParam = statusToRouteMap[status];
      if (newRouteParam && routeParam !== newRouteParam) {
        this.router.navigate(['../', newRouteParam], {
          relativeTo: this.route,
          replaceUrl: true,
        });
      }
    });
  }

  protected resource = rxResource({
    params: () => ({ search: this.search(), status: this.selectedTab() }),
    stream: ({ params }) =>
      this.ticketResource.tickets(this.#limit, 0, params.status, params.search),
  });

  tickets = computed(() => {
    if (this.resource.hasValue()) {
      return this.resource.value().services;
    }
    return [];
  });

  openModal(id: string) {
    this.ticketId.set(id);
    this.isOpen.set(true);
  }

  closeModal() {
    this.ticketId.set('');
    this.isOpen.set(false);
  }

  handleViewMore(item: TicketTable) {
    this.openModal(item.id.toString());
  }

  handleUpdate(item: TicketTable) {
    this.router.navigate(['/service/reply'], {
      state: {
        type: ReplyType.STATUS_UPDATE,
        ticketId: item.id,
        currentStatus: this.selectedTab(),
        serviceSection: item.serviceSection?.name,
      },
    });
  }

  handleUpdateSection(item: TicketTable) {
    this.router.navigate(['/service/reply'], {
      state: {
        type: ReplyType.SECTION_UPDATE,
        ticketId: item.id,
        currentStatus: this.selectedTab(),
        serviceSection: item.serviceSection?.name,
      },
    });
  }

  protected ticketStatusOptions: KeyValue<string, string>[] = [
    { key: TicketStatus.IN_PROGRESS, value: 'In Progress' },
    { key: TicketStatus.QC, value: 'QC' },
    { key: TicketStatus.DELIVERY_READY, value: 'Delivery Ready' },
    { key: TicketStatus.DELIVERED, value: 'Delivered' },
    { key: TicketStatus.CLOSED, value: 'Closed' },
  ];

  serviceSectionInfoMap: Record<ServiceSectionName, { label: string; color: BadgeColor }> = {
    [ServiceSectionName.LAP_CARE]: {
      label: 'Laptop Care',
      color: 'primary',
    },
    [ServiceSectionName.CHIP_LEVEL]: {
      label: 'Chip Level Repair',
      color: 'error',
    },
    [ServiceSectionName.DESKTOP_CARE]: {
      label: 'Desktop Care',
      color: 'info',
    },
    [ServiceSectionName.IPG]: {
      label: 'Industrial Printing Group',
      color: 'success',
    },
    [ServiceSectionName.VENDOR_ASP]: {
      label: 'Vendor Authorized Service Provider',
      color: 'light',
    },
    [ServiceSectionName.OUTSOURCE]: {
      label: 'Outsource',
      color: 'warning',
    },
    [ServiceSectionName.HOLD]: {
      label: 'On Hold',
      color: 'dark',
    },
  };
}
