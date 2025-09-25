import { Component, inject } from '@angular/core';
import { Badge } from '../../shared/components/ui/badge';
import { Dropdown } from '../../shared/components/ui/dropdown';
import { PageBreadcrumb } from '../../shared/components/ui/page-breadcrumb';
import { AvatarText } from '../../shared/components/avatar/avatar-text';
import { KeyValue } from '@angular/common';
import { TabGroup } from '../../shared/components/ui/tab-group';
import { WorklogStatistics } from './worklog-statistics';
import { Card } from '../../shared/components/cards/card';
import { Router } from '@angular/router';

export interface TicketTable {
  caseId: string;
  customer: {
    name: string;
    contact: string;
  };
  createdAt: string;
  assignedSection: string;
  assignedExecutive: string;
  status: string;
}
export enum TicketStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  QC = 'QC',
  DELIVERY_READY = 'DELIVERY_READY',
  DELIVERED = 'DELIVERED',
  CLOSED = 'CLOSED',
}

@Component({
  selector: 'app-ticket-list',
  imports: [Badge, Dropdown, TabGroup, PageBreadcrumb, AvatarText, WorklogStatistics, Card],
  template: `
    <app-page-breadcrumb pageTitle="Support Tickets" />
    <app-worklog-statistics />
    <app-card title="Support Tickets">
      <div card-actions class="flex flex-wrap overflow-x-auto w-full">
        <app-tab-group [options]="buttonGroupOptions" [(selected)]="selectedTab" />
      </div>
      <div class="overflow-x-auto custom-scrollbar">
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
                createdAt
              </th>
              <th
                class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400 hidden sm:table-cell"
              >
                Assigned Section
              </th>
              <th
                class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Executive Name
              </th>
              <th
                class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                Status
              </th>
              <th
                class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
              >
                <span class="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-white/[0.05]">
            @for (item of ticketTableData; track $index) {
              <tr>
                <td
                  class="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400 hidden sm:table-cell"
                >
                  {{ item.caseId }}
                </td>
                <td class="px-4 sm:px-6 py-3.5">
                  <div class="flex items-center gap-3">
                    <app-avatar-text [name]="item.customer.name" class="w-10 h-10" />
                    <div>
                      <span
                        class="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        {{ item.customer.name }}
                      </span>
                      <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                        {{ item.customer.contact }}
                      </span>
                    </div>
                  </div>
                </td>
                <td
                  class="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400 hidden sm:table-cell"
                >
                  {{ item.createdAt }}
                </td>
                <td class="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  {{ item.assignedSection }}
                </td>
                <td
                  class="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400 hidden sm:table-cell"
                >
                  {{ item.assignedExecutive }}
                </td>
                <td class="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  <app-badge size="sm">
                    {{ item.status }}
                  </app-badge>
                </td>
                <td class="px-4 py-4 text-gray-700 text-theme-sm dark:text-gray-400">
                  <app-dropdown>
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
                      <button
                        class="text-sm flex w-full rounded-lg px-3 py-2 text-left font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        (click)="handleUpdate(item)"
                      >
                        Update Status
                      </button>
                    </div>
                  </app-dropdown>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </app-card>
  `,
})
export class TicketList {
  // Type definition for the transaction data

  protected router = inject(Router);
  readonly selectedTab = TicketStatus.IN_PROGRESS;
  ticketTableData: TicketTable[] = [
    {
      caseId: 'C12345',
      customer: {
        name: 'John Smith',
        contact: 'john.smith@example.com',
      },
      createdAt: '2023-10-15T10:30:00Z',
      assignedSection: 'Customer Service',
      assignedExecutive: 'Alice Johnson',
      status: 'Open',
    },
    {
      caseId: 'C12346',
      customer: {
        name: 'Mary Johnson',
        contact: 'mary.johnson@example.com',
      },
      createdAt: '2023-09-29T14:45:00Z',
      assignedSection: 'Technical Support',
      assignedExecutive: 'Michael Brown',
      status: 'In Progress',
    },
    {
      caseId: 'C12347',
      customer: {
        name: 'Tom Riddle',
        contact: 'tom.riddle@example.com',
      },
      createdAt: '2023-08-20T09:00:00Z',
      assignedSection: 'Sales',
      assignedExecutive: 'Susan White',
      status: 'Closed',
    },
  ];

  handleViewMore(item: TicketTable) {
    // logic here
    console.log('View More:', item);
  }

  handleUpdate(item: TicketTable) {
    // logic here
    console.log('Delete:', item);
    this.router.navigate(['/service/reply', '123']);
  }

  protected buttonGroupOptions: KeyValue<string, string>[] = [
    { key: TicketStatus.IN_PROGRESS, value: 'In Progress' },
    { key: TicketStatus.QC, value: 'QC' },
    { key: TicketStatus.DELIVERY_READY, value: 'Delivery Ready' },
    { key: TicketStatus.DELIVERED, value: 'Delivered' },
    { key: TicketStatus.CLOSED, value: 'Closed' },
  ];
}
