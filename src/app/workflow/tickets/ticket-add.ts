import { Component, computed, inject } from '@angular/core';
import { PageBreadcrumb } from '../../shared/components/ui/page-breadcrumb';
import { TicketForm } from './ticket-form';
import { ActivatedRoute } from '@angular/router';
import { ServiceType } from './purchase-info-form';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-ticket-add',
  imports: [PageBreadcrumb, TicketForm],
  template: `
    <app-page-breadcrumb [pageTitle]="pageTitle()" />
    <app-ticket-form />
  `,
})
export class TicketAdd {
  protected route = inject(ActivatedRoute);
  protected serviceType = toSignal(
    this.route.data.pipe(map((d) => d['serviceType'] as ServiceType)),
    { initialValue: ServiceType.INHOUSE },
  );

  #serviceTypeMap: Record<ServiceType, string> = {
    [ServiceType.INHOUSE]: 'Carry in services',
    [ServiceType.OUTDOOR]: 'On-site/outdoor',
  };

  protected pageTitle = computed(() => this.#serviceTypeMap[this.serviceType()]);
}
