import {
  afterRenderEffect,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, map, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TicketResource } from './ticket-resource';
import { DatePipe } from '@angular/common';
import { AvatarText } from '../../shared/components/avatar/avatar-text';

// interface TicketMessage {
//   id: number;
//   userName: string;
//   userEmail: string;
//   userImage: string;
//   time: string;
//   content: string;
//   isSupport?: boolean;
// }

export enum TicketStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  QC = 'QC',
  DELIVERY_READY = 'DELIVERY_READY',
  DELIVERED = 'DELIVERED',
  CLOSED = 'CLOSED',
}

@Component({
  selector: 'app-ticket-reply',
  imports: [FormsModule, DatePipe, AvatarText],
  template: `
    <!-- ticket-reply.component.html -->
    <div
      class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <!-- Header -->
      <div
        class="flex flex-col justify-between gap-5 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center dark:border-gray-800"
      >
        <div>
          <h3 class="text-lg font-medium text-gray-800 dark:text-white/90">
            Ticket #{{ serviceLogs()?.case_id }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ serviceLogs()?.created_at | date: 'short' }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ currentPage() }} of {{ totalPages() }}
          </p>
          <div class="flex items-center gap-2">
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white/90"
            >
              <!-- Prev Icon -->
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current"
              >
                <path
                  d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
                  stroke=""
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </button>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white/90"
            >
              <!-- Next Icon -->
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current"
              >
                <path
                  d="M7.29167 15.8335L12.5 10.6252L7.29167 5.41683"
                  stroke=""
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </svg>
            </button>
          </div>
        </div>
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
              </div>
            </article>
          }
        </div>

        <!-- Reply Box -->
        <div class="pt-5">
          <div
            class="mx-auto max-h-[162px] w-full rounded-2xl border border-gray-200 shadow-xs dark:border-gray-800 dark:bg-gray-800"
          >
            <textarea
              [(ngModel)]="replyMessage"
              placeholder="Type your reply here..."
              class="h-20 w-full resize-none border-none bg-transparent p-5 text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white"
            ></textarea>
            <!-- <app-text-area -->
            <!--   id="reply_message" -->
            <!--   placeholder="Type your reply here..." -->
            <!--   class="h-20 w-full resize-none border-none bg-transparent p-5 font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white" -->
            <!-- /> -->
            <div class="flex items-center justify-between p-3">
              <button
                class="flex h-9 items-center gap-1.5 rounded-lg bg-transparent px-2 py-3 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300"
              >
                <!-- Attach Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                  <path
                    d="M14.4194 11.7679L15.4506 10.7367C17.1591 9.02811 17.1591 6.25802 15.4506 4.54947C13.742 2.84093 10.9719 2.84093 9.2634 4.54947L8.2322 5.58067M11.77 14.4172L10.7365 15.4507C9.02799 17.1592 6.2579 17.1592 4.54935 15.4507C2.84081 13.7422 2.84081 10.9721 4.54935 9.26352L5.58285 8.23002M11.7677 8.23232L8.2322 11.7679"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
                Attach
              </button>
              <button
                (click)="onReply()"
                class="bg-brand-500 hover:bg-brand-600 shadow-theme-xs inline-flex h-9 items-center justify-center rounded-lg px-4 py-3 text-sm font-medium text-white"
              >
                Reply
              </button>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div class="mt-6 flex flex-wrap items-center gap-4">
          <span class="text-gray-500 dark:text-gray-400">Status:</span>
          <div class="flex items-center gap-4">
            @for (status of ticketStaus; track $index) {
              <label
                class="flex cursor-pointer items-center text-sm font-medium text-gray-700 select-none dark:text-gray-400"
              >
                <input
                  [ngModel]="status"
                  type="radio"
                  class="sr-only"
                  [checked]="status === selected()"
                  (change)="changeStatus(status)"
                />
                <div
                  class="mr-3 flex h-4 w-4 items-center justify-center rounded-full border-[1.25px] hover:border-brand-500 dark:hover:border-brand-500 bg-transparent border-gray-300 dark:border-gray-700"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-white dark:bg-[#171f2e]"></span>
                </div>
                {{ status.toLowerCase() }}
              </label>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TicketReply {
  readonly TICKET_STATUS = TicketStatus;

  readonly ticketStaus = Object.keys(TicketStatus);
  readonly ticketMessages = [
    {
      id: 1,
      userName: 'John Doe',
      userEmail: 'jhondelin@gmail.com',
      userImage: '/images/support/user-1.jpg',
      time: 'Mon, 3:20 PM (2 hrs ago)',
      content: `Hi TailAdmin Team,<br>I hope you're doing well.<br>I’m currently working on customizing the TailAdmin dashboard and would like to add a new section labeled “Reports.” Before I proceed, I wanted to check if there’s any official guide or best practice you recommend for adding custom pages within the TailAdmin structure.`,
    },
    {
      id: 2,
      userName: 'Musharof Chowdhury',
      userEmail: 'support@tailadmin.com',
      userImage: '/images/support/user-2.jpg',
      time: 'Mon, 3:20 PM (1 hr ago)',
      content: `Hi John D,<br>Thanks for reaching out! You can add a new "Reports" section by editing the sidebar configuration file (sidebarData.ts) and adding a new entry with the label "Reports" and route "/reports".`,
      isSupport: true,
    },
    {
      id: 3,
      userName: 'John Doe',
      userEmail: 'jhondelin@gmail.com',
      userImage: '/images/support/user-1.jpg',
      time: 'Mon, 3:20 PM (30 mins ago)',
      content: `Thanks, Musharof! I’ll give it a try and update you if I face any issues.`,
    },
  ];

  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);
  readonly selected = model<TicketStatus>(TicketStatus.IN_PROGRESS);

  protected ticketResource = inject(TicketResource);

  reply = output<string>();
  statusChange = output<TicketStatus>();

  replyMessage = '';

  protected route = inject(ActivatedRoute);
  readonly ticketId = toSignal(this.route.paramMap.pipe(map((params) => params.get('id'))), {
    initialValue: null,
  });

  protected resource = rxResource({
    params: () => this.ticketId(),
    stream: ({ params }) => (params ? this.ticketResource.serviceLogs(params) : EMPTY),
  });

  protected serviceLogs = computed(() => {
    if (this.resource.hasValue()) {
      return this.resource.value().service;
    }
    return undefined;
  });

  protected messages = computed(() => [
    ...(this.serviceLogs()?.accessories || []).map((item) => ({
      ...item,
      userName: 'Test User1',
      role: 'FOE',
      time: new Date().toISOString(),
      content: `Accessories Attached: ${item.accessory_name}`,
    })),
    ...(this.serviceLogs()?.service_logs || []).map((item) => ({
      ...item,
      userName: 'Test User2',
      role: 'Executive',
      time: new Date().toISOString(),
      content: `Service Log:<br>
              Type: ${item.service_log_type}<br>
              Description: ${item.log_description}`, // Creating combined content for service_logs
    })),
  ]);

  onReply() {
    if (this.replyMessage.trim()) {
      this.reply.emit(this.replyMessage);
      this.replyMessage = '';
    }
  }

  changeStatus(newStatus: string) {
    console.log('newStatus', newStatus);
    this.selected.set(newStatus as TicketStatus);
    this.statusChange.emit(newStatus as TicketStatus);
  }
}
