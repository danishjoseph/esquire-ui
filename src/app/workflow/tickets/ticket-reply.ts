import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TicketResource, TicketStatus } from './ticket-resource';
import { DatePipe } from '@angular/common';
import { AvatarText } from '../../shared/components/avatar/avatar-text';
import { Button } from '../../shared/components/ui/button';
import { TextArea } from '../../shared/components/form/basic/text-area';
import {
  ITicketUpdateForm,
  LogType,
  ServiceSectionNameOptions,
  TicketFormService,
} from './ticket-form-service';
import { Option, Select } from '../../shared/components/form/basic/select';
import { Badge, BadgeColor } from '../../shared/components/ui/badge';
import { statusToRouteMap } from './ticket-list';
import { NotificationService } from '../../shared/components/ui/notification-service';
import { UserResource, UserRole } from '../../settings/users/user-resource';

export enum ReplyType {
  STATUS_UPDATE = 'STATUS_UPDATE',
  SECTION_UPDATE = 'SECTION_UPDATE',
  ASSIGN = 'ASSIGN',
}

@Component({
  selector: 'app-ticket-reply',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    AvatarText,
    Button,
    TextArea,
    Select,
    Badge,
  ],
  template: `
    <div
      class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <!-- Header -->
      <div
        class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800"
      >
        <div>
          <div class="flex">
            <h3 class="text-lg font-medium text-gray-800 dark:text-white/90">
              Ticket #{{ serviceLogs()?.case_id }}
            </h3>
            &nbsp;
            <app-badge
              [color]="
                ticketStatusInfoMap[ticketInfo().currentStatus || TICKET_STATUS.IN_PROGRESS].color
              "
            >
              {{
                ticketStatusInfoMap[ticketInfo().currentStatus || TICKET_STATUS.IN_PROGRESS].label
              }}
            </app-badge>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ serviceLogs()?.created_at | date: 'short' }}
          </p>
        </div>
        <app-button size="xs" variant="outline" [startIcon]="backIcon" (btnClick)="goBack()">
          Back
        </app-button>
      </div>

      <!-- Messages -->
      <div class="relative px-6 py-7">
        <div
          class="custom-scrollbar h-[calc(58vh-162px)] space-y-7 divide-y divide-gray-200 overflow-y-auto pr-2 dark:divide-gray-800"
        >
          @for (message of messages(); track $index) {
            <article>
              <div class="mb-6 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <app-avatar-text [name]="message.userName" class="w-10 h-10" />
                  <div>
                    <p class="text-sm font-medium text-gray-800 dark:text-white/90">
                      {{ message.userName }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ message.role }}</p>
                  </div>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ message.time | date: 'short' }}
                  </p>
                </div>
              </div>
              <div class="pb-6">
                <p
                  class="text-sm text-gray-500 dark:text-gray-400"
                  [innerHTML]="message.content"
                ></p>
                <app-badge size="sm" [color]="logTypeInfoMap[message.type].color">
                  #{{ logTypeInfoMap[message.type].label }}
                </app-badge>
              </div>
            </article>
          }
        </div>

        <!-- Reply Box -->
        <form [formGroup]="form()" (ngSubmit)="onReply()">
          <div class="pt-5">
            <div
              class="mx-auto w-full rounded-2xl border border-gray-200 shadow-xs dark:border-gray-800 dark:bg-gray-800"
            >
              <app-text-area
                id="reply_message"
                placeholder="Type your reply here..."
                formControlName="service_log_description"
                className="h-20 w-full resize-none border-none bg-transparent p-5 font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white"
              />
              <div class="flex items-center gap-2">
                <app-button size="xs" variant="transparent" [startIcon]="attachIcon">
                  Attach
                </app-button>
                @if (ticketInfo().type === REPLY_TYPE.SECTION_UPDATE) {
                  <app-select
                    id="service_section_name"
                    formControlName="service_section_name"
                    placeholder="Assign Service Section"
                    [options]="SERVICE_SECTION_NAME_OPTIONS"
                  />
                }
                @if (ticketInfo().type === REPLY_TYPE.ASSIGN) {
                  <app-select
                    id="assign_engineer"
                    formControlName="assigned_user"
                    placeholder="Assign Engineer"
                    [options]="assignEngineerOptions()"
                  />
                }
              </div>
              <div class="flex items-center justify-center md:justify-end p-3">
                <app-button type="submit" [disabled]="form().invalid">
                  {{ buttonText() }}
                </app-button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TicketReply {
  readonly REPLY_TYPE = ReplyType;
  readonly TICKET_STATUS = TicketStatus;
  readonly SERVICE_SECTION_NAME_OPTIONS = ServiceSectionNameOptions;
  readonly attachIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"><path d="M14.4194 11.7679L15.4506 10.7367C17.1591 9.02811 17.1591 6.25802 15.4506 4.54947C13.742 2.84093 10.9719 2.84093 9.2634 4.54947L8.2322 5.58067M11.77 14.4172L10.7365 15.4507C9.02799 17.1592 6.2579 17.1592 4.54935 15.4507C2.84081 13.7422 2.84081 10.9721 4.54935 9.26352L5.58285 8.23002M11.7677 8.23232L8.2322 11.7679" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
  readonly backIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-current"><path d="M12.7083 5L7.5 10.2083L12.7083 15.4167" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);

  readonly ticketInfo = signal({
    ticketId: null,
    currentStatus: null,
    serviceSection: null,
    type: null,
    assigned_user: {
      name: null,
      sub: null,
    },
  });

  readonly nextStatus = computed(() => {
    const statusOrder = [
      TicketStatus.IN_PROGRESS,
      TicketStatus.QC,
      TicketStatus.DELIVERY_READY,
      TicketStatus.DELIVERED,
      TicketStatus.CLOSED,
    ];
    const currentStatus = this.ticketInfo().currentStatus;
    const currentIndex = statusOrder.indexOf(currentStatus ?? TicketStatus.IN_PROGRESS);
    return currentIndex !== -1 && currentIndex < statusOrder.length - 1
      ? statusOrder[currentIndex + 1]
      : TicketStatus.IN_PROGRESS;
  });

  protected ticketResource = inject(TicketResource);
  protected userResource = inject(UserResource);
  protected router = inject(Router);
  protected destroyRef = inject(DestroyRef);
  protected notificationService = inject(NotificationService);
  protected ticketFormService = inject(TicketFormService);

  protected form = computed<FormGroup<ITicketUpdateForm>>(
    () => this.ticketFormService.ticketUpdateform,
  );

  constructor() {
    const state = this.router.currentNavigation()?.extras.state;
    if (state && typeof state === 'object' && 'ticketId' in state && 'currentStatus' in state) {
      const { ticketId, currentStatus, serviceSection, type, assigned_user } = state;
      this.ticketInfo.set({
        ticketId,
        currentStatus,
        serviceSection,
        type,
        assigned_user,
      });
      this.form().patchValue({
        service_section_name: serviceSection,
        assigned_user: assigned_user?.name ?? null,
      });
    } else {
      this.router.navigate(['service/tickets']);
    }
  }

  protected resource = rxResource({
    params: () => this.ticketInfo().ticketId,
    stream: ({ params }) => (params ? this.ticketResource.serviceLogs(params) : EMPTY),
  });

  protected userListResource = rxResource({
    params: () => this.ticketInfo().ticketId,
    stream: ({ params }) => (params ? this.userResource.users(20, 0, '') : EMPTY),
  });

  protected serviceLogs = computed(() => {
    if (this.resource.hasValue()) {
      return this.resource.value().service;
    }
    return undefined;
  });

  protected buttonText = computed(() => {
    const { type } = this.ticketInfo();
    if (type === ReplyType.SECTION_UPDATE) return 'Update';
    else if (type === ReplyType.ASSIGN) return 'Assign';
    else return `Move to ${statusToRouteMap[this.nextStatus()]}`;
  });

  readonly assignEngineerOptions = computed<Option[]>(() => {
    if (this.userListResource.hasValue()) {
      const { users } = this.userListResource.value();
      return users
        .filter((u) => u.role === UserRole.ENGINEER)
        .map((u) => ({ value: u.sub, label: u.name }));
    }
    return [];
  });

  readonly logTypeInfoMap: Record<LogType, { label: string; color: BadgeColor }> = {
    [LogType.DIAGNOSIS]: {
      label: 'Diagnosis',
      color: 'warning',
    },
    [LogType.COMPLAINTS]: {
      label: 'Complaints',
      color: 'error',
    },
    [LogType.STATUS_UPDATE]: {
      label: 'Update',
      color: 'success',
    },
    [LogType.FEEDBACK]: {
      label: 'Feedback',
      color: 'primary',
    },
  };

  readonly ticketStatusInfoMap: Record<TicketStatus, { label: string; color: BadgeColor }> = {
    [TicketStatus.IN_PROGRESS]: {
      label: 'In Progress',
      color: 'warning',
    },
    [TicketStatus.QC]: {
      label: 'QC',
      color: 'primary',
    },
    [TicketStatus.DELIVERY_READY]: {
      label: 'Delivery Ready',
      color: 'success',
    },
    [TicketStatus.DELIVERED]: {
      label: 'Delivered',
      color: 'light',
    },
    [TicketStatus.CLOSED]: {
      label: 'Closed',
      color: 'dark',
    },
  };

  protected messages = computed(() => [
    ...(this.serviceLogs()?.accessories || []).map((item) => ({
      ...item,
      userName: item.created_by?.name || '-',
      role: item.created_by?.role,
      time: item.created_at,
      type: LogType.DIAGNOSIS,
      content: `Accessories Attached: ${item.accessory_name}`,
    })),
    ...(this.serviceLogs()?.service_logs || []).map((item) => ({
      ...item,
      userName: item.updated_by?.name || '-',
      role: item.updated_by?.role,
      time: item.updated_at,
      type: item.service_log_type,
      content: `${item.log_description}`,
    })),
  ]);

  onReply() {
    const formValue = this.form().getRawValue();
    const workLog = {
      service_log_type: formValue.service_log_type as LogType,
      log_description: formValue.service_log_description,
    };
    const serviceData = {
      id: this.ticketInfo().ticketId as unknown as number,
      status:
        this.ticketInfo().type === this.REPLY_TYPE.STATUS_UPDATE
          ? this.nextStatus()
          : TicketStatus.IN_PROGRESS,
      service_logs: [workLog],
      service_section_name: formValue.service_section_name,
      assigned_user: formValue.assigned_user,
    };
    return this.ticketResource
      .update(serviceData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.form().reset();
          if (this.ticketInfo().type === ReplyType.STATUS_UPDATE) {
            this.router.navigateByUrl(`/service/tickets/${statusToRouteMap[this.nextStatus()]}`);
          } else {
            this.router.navigateByUrl(
              `/service/tickets/${statusToRouteMap[this.ticketInfo().currentStatus || TicketStatus.IN_PROGRESS]}`,
            );
          }
          this.notificationService.showNotification('Feedback updated');
        },
      });
  }

  goBack() {
    this.router.navigateByUrl(
      `/service/tickets/${statusToRouteMap[this.ticketInfo().currentStatus || TicketStatus.IN_PROGRESS]}`,
    );
  }
}
