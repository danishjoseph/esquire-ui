import { Component, computed, inject } from '@angular/core';
import { Badge, BadgeColor } from '../shared/components/ui/badge';
import { SafeHtmlPipe } from '../shared/pipe/safe-html-pipe';
import { Button } from '../shared/components/ui/button';
import { Router } from '@angular/router';
import { DashboardResource } from './dashboard-resource';
import { rxResource } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-service-metrics',
  imports: [Badge, SafeHtmlPipe, Button],
  template: `
    <div
      class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
    >
      <app-button
        size="xs"
        variant="icon"
        [startIcon]="icons.serviceIcon"
        (btnClick)="router.navigate(['/service/tickets'])"
      />
      <div class="flex items-end justify-between mt-5">
        <div>
          <span class="text-sm text-gray-500 dark:text-gray-400">Services</span>
          <h4 class="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            @if (serviceInfo(); as serviceInfo) {
              {{ serviceInfo.totalServices }}
              <span class="text-sm text-gray-400 dark:text-gray-400">
                ( {{ serviceInfo.currentMonthServices }} )
              </span>
            } @else {
              {{ '-' }}
            }
          </h4>
        </div>
        @if (serviceKpi(); as kpi) {
          <app-badge [color]="kpi.color">
            <span [innerHTML]="kpi.icon | appSafeHtml"></span>
            {{ kpi.text }}
          </app-badge>
        } @else {
          <app-badge color="light"> No available </app-badge>
        }
      </div>
    </div>
  `,
})
export class serviceMetrics {
  readonly icons = {
    serviceIcon: `<svg width="2em" height="2em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 17.0518V12C20 7.58174 16.4183 4 12 4C7.58168 4 3.99994 7.58174 3.99994 12V17.0518M19.9998 14.041V19.75C19.9998 20.5784 19.3282 21.25 18.4998 21.25H13.9998M6.5 18.75H5.5C4.67157 18.75 4 18.0784 4 17.25V13.75C4 12.9216 4.67157 12.25 5.5 12.25H6.5C7.32843 12.25 8 12.9216 8 13.75V17.25C8 18.0784 7.32843 18.75 6.5 18.75ZM17.4999 18.75H18.4999C19.3284 18.75 19.9999 18.0784 19.9999 17.25V13.75C19.9999 12.9216 19.3284 12.25 18.4999 12.25H17.4999C16.6715 12.25 15.9999 12.9216 15.9999 13.75V17.25C15.9999 18.0784 16.6715 18.75 17.4999 18.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`,
    arrowDownIcon: `<svg class="fill-current" width="1em" height="1em" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.31462 10.3761C5.45194 10.5293 5.65136 10.6257 5.87329 10.6257C5.8736 10.6257 5.8739 10.6257 5.87421 10.6257C6.0663 10.6259 6.25845 10.5527 6.40505 10.4062L9.40514 7.4082C9.69814 7.11541 9.69831 6.64054 9.40552 6.34754C9.11273 6.05454 8.63785 6.05438 8.34486 6.34717L6.62329 8.06753L6.62329 1.875C6.62329 1.46079 6.28751 1.125 5.87329 1.125C5.45908 1.125 5.12329 1.46079 5.12329 1.875L5.12329 8.06422L3.40516 6.34719C3.11218 6.05439 2.6373 6.05454 2.3445 6.34752C2.0517 6.64051 2.05185 7.11538 2.34484 7.40818L5.31462 10.3761Z" fill=""></path></svg>`,
    arrowUpIcon: `<svg class="fill-current" width="1em" height="1em" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.06462 1.62393C6.20193 1.47072 6.40135 1.37432 6.62329 1.37432C6.6236 1.37432 6.62391 1.37432 6.62422 1.37432C6.81631 1.37415 7.00845 1.44731 7.15505 1.5938L10.1551 4.5918C10.4481 4.88459 10.4483 5.35946 10.1555 5.65246C9.86273 5.94546 9.38785 5.94562 9.09486 5.65283L7.37329 3.93247L7.37329 10.125C7.37329 10.5392 7.03751 10.875 6.62329 10.875C6.20908 10.875 5.87329 10.5392 5.87329 10.125L5.87329 3.93578L4.15516 5.65281C3.86218 5.94561 3.3873 5.94546 3.0945 5.65248C2.8017 5.35949 2.80185 4.88462 3.09484 4.59182L6.06462 1.62393Z" fill=""></path></svg>`,
  };

  protected router = inject(Router);
  protected dashboardResource = inject(DashboardResource);

  private resource = rxResource({
    stream: () => this.dashboardResource.fetchServiceMetrics(),
  });

  readonly serviceInfo = computed(() => {
    if (this.resource.hasValue()) {
      const serviceInfo = this.resource.value()?.serviceMetrics;
      return {
        currentMonthServices: serviceInfo.currentMonthCount,
        totalServices: serviceInfo.total,
      };
    }
    return undefined;
  });

  readonly serviceKpi = computed(() => {
    if (this.resource.hasValue()) {
      const kpi = this.resource.value()?.serviceMetrics;
      if (kpi === null || kpi === undefined) return null;
      const color: BadgeColor = kpi.monthlyGrowth > 0 ? 'success' : 'error';
      const icon = kpi.monthlyGrowth > 0 ? this.icons.arrowUpIcon : this.icons.arrowDownIcon;
      const text = `${kpi.monthlyGrowth}%`;
      return { color, icon, text };
    }
    return undefined;
  });
}
