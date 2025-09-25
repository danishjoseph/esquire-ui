import { Component } from '@angular/core';
import { CustomerForm } from '../../customers/customer-form';
import { FormGroup } from '@angular/forms';
import { Card } from '../../shared/components/cards/card';
import { PageBreadcrumb } from '../../shared/components/ui/page-breadcrumb';
import { Button } from '../../shared/components/ui/button';
import { ProductForm } from '../../products/product-form';
import { PurchaseInfoForm } from './purchase-info-form';
import { ServiceChargeForm } from './service-charge-form';
import { WorklogForm } from './worklog-form';

@Component({
  selector: 'app-ticket-add',
  imports: [
    CustomerForm,
    Card,
    PageBreadcrumb,
    Button,
    ProductForm,
    PurchaseInfoForm,
    ServiceChargeForm,
    WorklogForm,
  ],
  template: `
    <app-page-breadcrumb pageTitle="Add Ticket" />
    <div class="flex flex-col space-y-6">
      <app-card title="Customer Information">
        <app-button size="xs" variant="outline" class="flex justify-end" [startIcon]="searchIcon">
          Add Existing
        </app-button>
        <app-customer-form [formGroup]="form" />
      </app-card>
      <app-card title="Product & Purchase Information">
        <app-button size="xs" variant="outline" class="flex justify-end" [startIcon]="searchIcon">
          Add Existing
        </app-button>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:space-y-0 space-y-4">
          <div>
            <app-product-form [formGroup]="form"></app-product-form>
          </div>
          <div>
            <app-purchase-info-form></app-purchase-info-form>
          </div>
        </div>
      </app-card>
      <app-card title="Diagnostics Information">
        <app-worklog-form />
      </app-card>
      <app-card title="Service Charges Information">
        <app-service-charge-form [formGroup]="form" />
      </app-card>
      <div class="inline-flex self-end gap-3">
        <app-button variant="outline"> Clear </app-button>
        <app-button> Open Ticket </app-button>
      </div>
    </div>
  `,
})
export class TicketAdd {
  readonly form = new FormGroup({});

  readonly editIcon = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`;
  readonly deleteIcon = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
  readonly searchIcon = `<svg class="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z" fill=""></path></svg>`;
}
