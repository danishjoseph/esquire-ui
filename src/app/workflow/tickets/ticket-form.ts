import { afterRenderEffect, Component, DestroyRef, inject, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ServiceChargeForm } from './service-charge-form';
import { WorklogForm } from './worklog-form';
import { PurchaseInfoForm, ServiceType } from './purchase-info-form';
import { ProductForm } from '../../products/product-form';
import { ICustomerForm } from '../../customers/customer-form-service';
import { CreateServiceInput, TicketResource, TicketStatus, TicketView } from './ticket-resource';
import { Button } from '../../shared/components/ui/button';
import { Card } from '../../shared/components/cards/card';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, EMPTY } from 'rxjs';
import {
  TicketFormService,
  IAccessory,
  IPurchaseInfo,
  IServiceCharge,
  IWorkLog,
  IWorkLogForm,
  ProductCondition,
} from './ticket-form-service';
import { IProductForm, ProductFormService } from '../../products/product-form-service';
import { CustomerFormService } from '../../customers/customer-form-service';
import { CustomerForm } from '../../customers/customer-form';
import { Dropdown } from '../../shared/components/ui/dropdown';
import { Customer, CustomerResource } from '../../customers/customer-resource';
import { ProductList, ProductResource } from '../../products/product-resource';
import { SearchInput } from '../../shared/components/form/search-input';
import { NotificationService } from '../../shared/components/ui/notification-service';

export interface ITicketForm {
  product: FormGroup<IProductForm>;
  customer: FormGroup<ICustomerForm>;
  purchase: FormGroup<IPurchaseInfo>;
  worklog: FormGroup<IWorkLogForm>;
  serviceCharge: FormGroup<IServiceCharge>;
}

@Component({
  selector: 'app-ticket-form',
  imports: [
    ReactiveFormsModule,
    Button,
    Card,
    Card,
    Button,
    CustomerForm,
    ProductForm,
    PurchaseInfoForm,
    ServiceChargeForm,
    WorklogForm,
    Dropdown,
    SearchInput,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="openTicket()">
      <div class="flex flex-col space-y-6">
        <app-card title="Customer Information">
          @if (!ticketId()) {
            <div class="flex justify-end">
              <app-dropdown class="relative" className="absolute w-full z-10">
                <div dropdown-button>
                  <app-search-input placeholder="Add Existing" [formControl]="customerSearch$" />
                </div>
                <div dropdown-content class="max-h-40 overflow-y-auto">
                  @if (customers.hasValue() && customers.value().customers.length) {
                    <ul>
                      @for (customer of customers.value().customers; track $index) {
                        <li
                          class="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400 cursor-pointer"
                          (click)="handleCustomerClick(customer)"
                          (keydown.enter)="handleCustomerClick(customer)"
                          (keydown.space)="handleCustomerClick(customer)"
                          tabindex="0"
                          role="button"
                        >
                          <span
                            class="ml-2 block h-[3px] w-[3px] rounded-full bg-gray-500 dark:bg-gray-400"
                          ></span
                          ><span> {{ customer.name }} ({{ customer.mobile }})</span>
                        </li>
                      }
                    </ul>
                  }
                </div>
              </app-dropdown>
            </div>
          }
          <app-customer-form [formGroup]="form.controls.customer" />
        </app-card>
        <app-card title="Product & Purchase Information">
          @if (!ticketId()) {
            <div class="flex justify-end">
              <app-dropdown class="relative" className="absolute w-full">
                <div dropdown-button>
                  <app-search-input placeholder="Search Product" [formControl]="productSearch$" />
                </div>
                <div dropdown-content class="max-h-40 overflow-y-auto">
                  @if (products.hasValue() && products.value().products.length) {
                    <ul>
                      @for (product of products.value().products; track $index) {
                        <li
                          class="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500 last:border-b-0 dark:border-gray-800 dark:text-gray-400 cursor-pointer"
                          (click)="handleProductClick(product)"
                          (keydown.enter)="handleProductClick(product)"
                          (keydown.space)="handleProductClick(product)"
                          tabindex="0"
                          role="button"
                        >
                          <span
                            class="ml-2 block h-[3px] w-[3px] rounded-full bg-gray-500 dark:bg-gray-400"
                          ></span
                          ><span> {{ product.name }} ({{ product.serialNumber }})</span>
                        </li>
                      }
                    </ul>
                  }
                </div>
              </app-dropdown>
            </div>
          }
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:space-y-0 space-y-4">
            <div>
              <app-product-form [formGroup]="form.controls.product" />
            </div>
            <div>
              <app-purchase-info-form [formGroup]="form.controls.purchase" />
            </div>
          </div>
        </app-card>
        @if (!ticketId()) {
          <app-card title="Diagnostics Information">
            <app-worklog-form [formGroup]="form.controls.worklog" />
          </app-card>
        }
        <app-card title="Service Charges Information">
          <app-service-charge-form
            [formGroup]="form.controls.serviceCharge"
            [ticketId]="ticketId()"
          />
        </app-card>
        @if (!ticketId()) {
          <div class="inline-flex self-end gap-3">
            <app-button variant="outline" (btnClick)="clear()"> Clear </app-button>
            <app-button [disabled]="form.invalid" (btnClick)="openTicket()">
              Open Ticket
            </app-button>
          </div>
        }
      </div>
    </form>
  `,
})
export class TicketForm {
  readonly editIcon = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="size-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`;
  readonly deleteIcon = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
  readonly searchIcon = `<svg class="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z" fill=""></path></svg>`;

  readonly ticketId = input('');
  protected ticketResource = inject(TicketResource);
  protected ticketFormService = inject(TicketFormService);
  protected customerFormService = inject(CustomerFormService);
  protected productFormService = inject(ProductFormService);
  private destroyRef = inject(DestroyRef);
  protected customerResource = inject(CustomerResource);
  protected productResource = inject(ProductResource);
  protected notificationService = inject(NotificationService);

  protected customerSearch$ = new FormControl('', { nonNullable: true });
  protected customerSearch = toSignal(this.customerSearch$.valueChanges.pipe(debounceTime(500)), {
    initialValue: '',
  });

  protected productSearch$ = new FormControl('', { nonNullable: true });
  protected productSearch = toSignal(this.productSearch$.valueChanges.pipe(debounceTime(500)), {
    initialValue: '',
  });

  protected customers = rxResource({
    params: () => this.customerSearch(),
    stream: ({ params }) => this.customerResource.customers(10, 0, params),
  });

  protected products = rxResource({
    params: () => this.productSearch(),
    stream: ({ params }) => this.productResource.products(10, 0, params),
  });

  protected handleCustomerClick(customer: Customer) {
    this.form.controls.customer.patchValue(customer);
    this.customerSearch$.reset();
    this.form.controls.customer.disable();
  }

  protected handleProductClick(product: ProductList) {
    this.form.controls.product.patchValue({
      id: product.id,
      name: product.name,
      serial_number: product.serialNumber,
      model_name: product.modelName,
      category: product.category,
      brand: product.brand,
    });
    this.productSearch$.reset();
    this.form.controls.product.disable();
  }

  clear() {
    this.form.reset();
    Object.keys(this.form.controls).forEach((field) => {
      const control = this.form.get(field);
      control?.enable();
    });
    this.ticketFormService.worklogForm.controls.work_logs.clear();
    this.ticketFormService.worklogForm.controls.accessories.clear();
  }

  constructor() {
    afterRenderEffect(() => {
      if (this.resource.hasValue()) {
        const data = this.resource.value().service;
        const formValue = this.toFormValue(data);
        this.form.patchValue(formValue);
        Object.keys(this.form.controls).forEach((field) => {
          const control = this.form.get(field);
          control?.disable();
        });
      }
    });
    this.destroyRef.onDestroy(() => {
      this.clear();
    });
  }

  readonly form = new FormGroup<ITicketForm>({
    product: this.productFormService.productForm,
    customer: this.customerFormService.customerForm,
    purchase: this.ticketFormService.purchaseInfoForm,
    worklog: this.ticketFormService.worklogForm,
    serviceCharge: this.ticketFormService.serviceChargeForm,
  });

  openTicket() {
    const request = this.toCreateRequest(this.form.getRawValue());
    this.ticketResource.create(request).subscribe({
      next: (res) => {
        this.notificationService.showNotification(`Ticket Created ${res?.createService.caseId}`);
        this.form.reset();
      },
    });
  }

  toCreateRequest(form: FormGroup<ITicketForm>['value']): CreateServiceInput {
    console.log('form', form);
    const { purchase, product, customer, worklog, serviceCharge } = form;
    if (product?.id === null) {
      delete product.id;
    }
    if (customer?.id === null) {
      delete customer.id;
    }
    const purchaseInput = {
      ...(purchase?.purchase_status && { purchase_status: purchase.purchase_status }),
      ...(purchase?.warranty_status && { warranty_status: purchase.warranty_status }),
      ...(purchase?.purchase_date && { purchase_date: purchase.purchase_date }),
      ...(purchase?.invoice_number && { invoice_number: purchase.invoice_number }),
      ...(purchase?.warranty_expiry && { warranty_expiry: purchase.warranty_expiry }),
      ...(purchase?.asc_start_date && { asc_start_date: purchase.asc_start_date }),
      ...(purchase?.asc_expiry_date && { asc_expiry_date: purchase.asc_expiry_date }),
      ...(!product?.id && { product }),
      ...(product?.id && { product_id: product.id.toString() }),
      ...(!customer?.id && { customer }),
      ...(customer?.id && { customer_id: customer.id.toString() }),
    } as CreateServiceInput['purchase'];
    const service_logs = worklog?.work_logs as unknown as IWorkLog[];
    const accessories = worklog?.accessories as unknown as IAccessory[];
    return {
      status: TicketStatus.IN_PROGRESS,
      service_type: ServiceType.INHOUSE,
      ...(purchase?.service_status && { service_status: purchase.service_status }),
      quotation_amount: Number(serviceCharge?.quotation_amount),
      service_charge: Number(serviceCharge?.service_charge),
      gst_amount: Number(serviceCharge?.gst_amount),
      total_amount: Number(serviceCharge?.total_amount),
      advance_amount: Number(serviceCharge?.advance_amount),
      product_condition: worklog?.product_condition as ProductCondition,
      purchase: purchaseInput,
      accessories,
      service_logs,
    };
  }

  toFormValue(data: TicketView): FormGroup<ITicketForm>['value'] {
    const purchase = data.purchase;
    const product = purchase.product;
    const customer = purchase.customer;
    const purchaseInfo = {
      purchase_status: data.purchase.purchase_status,
      warranty_status: purchase.warranty_status,
      purchase_date: purchase.purchase_date,
      invoice_number: purchase.invoice_number,
      warranty_expiry: purchase.warranty_expiry,
      asc_start_date: purchase.asc_start_date,
      asc_expiry_date: purchase.asc_expiry_date,
      service_status: data.service_status,
    };
    const worklog = {
      product_condition: data.product_condition,
      work_logs: data.service_logs,
      accessories: data.accessories,
    };
    const serviceCharge = {
      quotation_amount: data.quotation_amount.toString(),
      service_charge: data.service_charge.toString(),
      gst_amount: data.gst_amount.toString(),
      total_amount: data.total_amount.toString(),
      advance_amount: data.advance_amount.toString(),
    };

    return {
      product,
      customer,
      purchase: purchaseInfo,
      worklog,
      serviceCharge,
    };
  }

  protected resource = rxResource({
    params: () => this.ticketId(),
    stream: ({ params }) => (params ? this.ticketResource.ticket(params) : EMPTY),
  });
}
