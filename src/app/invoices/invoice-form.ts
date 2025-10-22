import { afterRenderEffect, Component, DestroyRef, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IPurchaseInfo, TicketFormService } from '../workflow/tickets/ticket-form-service';
import { IProductForm, ProductFormService } from '../products/product-form-service';
import { Dropdown } from '../shared/components/ui/dropdown';
import { SearchInput } from '../shared/components/form/search-input';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, EMPTY } from 'rxjs';
import { Button } from '../shared/components/ui/button';
import { PurchaseInfoForm } from '../workflow/tickets/purchase-info-form';
import { ProductForm } from '../products/product-form';
import { CreatePurchaseInput, InvoiceResource, Purchase } from './invoice-resource';
import { CustomerFormService, ICustomerForm } from '../customers/customer-form-service';
import { Customer, CustomerResource } from '../customers/customer-resource';
import { CustomerForm } from '../customers/customer-form';
import { Card } from '../shared/components/cards/card';
import { NotificationService } from '../shared/components/ui/notification-service';

export interface IInvoiceForm {
  customer: FormGroup<ICustomerForm>;
  product: FormGroup<IProductForm>;
  purchase: FormGroup<IPurchaseInfo>;
}

@Component({
  selector: 'app-invoice-form',
  imports: [
    ReactiveFormsModule,
    Dropdown,
    Button,
    SearchInput,
    CustomerForm,
    ProductForm,
    PurchaseInfoForm,
    Card,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="handleFormSubmit()">
      <div class="flex flex-col space-y-6">
        <app-card title="Customer Information">
          @if (!invoiceId()) {
            <div card-actions>
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
        <app-card title="Invoice Information">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:space-y-0 space-y-4">
            <div>
              <app-product-form [formGroup]="form.controls.product" />
            </div>
            <div>
              <app-purchase-info-form [formGroup]="form.controls.purchase" />
            </div>
          </div>
        </app-card>
        <div class="inline-flex self-end gap-3">
          @if (this.invoiceId()) {
            <app-button variant="outline" (btnClick)="closeModal()"> Close </app-button>
          } @else {
            <app-button variant="outline" (btnClick)="clear()"> Clear </app-button>
          }
          <app-button [disabled]="form.invalid" (btnClick)="handleFormSubmit()">
            {{ this.invoiceId() ? 'Update' : 'Add' }} Invoice
          </app-button>
        </div>
      </div>
    </form>
  `,
})
export class InvoiceForm {
  readonly formSubmit = output();
  readonly invoiceId = input('');

  protected ticketFormService = inject(TicketFormService);
  protected customerFormService = inject(CustomerFormService);
  protected productFormService = inject(ProductFormService);
  protected customerResource = inject(CustomerResource);
  protected invoiceResource = inject(InvoiceResource);
  protected notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  readonly form = new FormGroup<IInvoiceForm>({
    customer: this.customerFormService.customerForm,
    product: this.productFormService.productForm,
    purchase: this.ticketFormService.purchaseInfoForm,
  });

  protected customerSearch$ = new FormControl('', { nonNullable: true });
  protected customerSearch = toSignal(this.customerSearch$.valueChanges.pipe(debounceTime(500)), {
    initialValue: '',
  });

  protected customers = rxResource({
    params: () => this.customerSearch(),
    stream: ({ params }) => this.customerResource.customers(10, 0, params),
  });

  protected handleCustomerClick(customer: Customer) {
    this.form.controls.customer.patchValue(customer);
    this.customerSearch$.reset();
    this.form.controls.customer.disable();
  }

  protected handleFormSubmit() {
    return this.invoiceId() ? this.update() : this.add();
  }

  clear() {
    this.form.reset();
    Object.keys(this.form.controls).forEach((field) => {
      const control = this.form.get(field);
      control?.enable();
    });
  }

  closeModal() {
    this.clear();
    this.formSubmit.emit();
  }

  add() {
    const request = this.toRequest(this.form.getRawValue());
    this.invoiceResource.create(request).subscribe({
      next: (res) => {
        this.notificationService.showNotification(`Invoice Created ${res?.id}`);
        this.closeModal();
      },
    });
  }

  update() {
    const request = this.toRequest(this.form.getRawValue());
    this.invoiceResource.update({ ...request, id: Number(this.invoiceId()) }).subscribe({
      next: (res) => {
        this.notificationService.showNotification(`Invoice Updated ${res?.updatePurchase.id}`);
        this.closeModal();
      },
    });
  }

  protected resource = rxResource({
    params: () => this.invoiceId(),
    stream: ({ params }) => (params ? this.invoiceResource.invoice(params) : EMPTY),
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.resource.hasValue()) {
        const data = this.resource.value().purchase;
        const formValue = this.toFormValue(data);
        this.form.patchValue(formValue);
      }
    });
    this.destroyRef.onDestroy(() => {
      this.clear();
    });
  }

  private toRequest(form: FormGroup<IInvoiceForm>['value']): CreatePurchaseInput {
    const { customer, product, purchase } = form;
    const product_id = product?.id?.toString();
    const customer_id = customer?.id?.toString();
    delete customer?.id;
    delete product?.id;
    return {
      ...(purchase?.purchase_status && { purchase_status: purchase.purchase_status }),
      ...(purchase?.warranty_status && { warranty_status: purchase.warranty_status }),
      ...(purchase?.purchase_date && { purchase_date: purchase.purchase_date }),
      ...(purchase?.invoice_number && { invoice_number: purchase.invoice_number }),
      ...(purchase?.warranty_expiry && { warranty_expiry: purchase.warranty_expiry }),
      ...(purchase?.asc_start_date && { asc_start_date: purchase.asc_start_date }),
      ...(purchase?.asc_expiry_date && { asc_expiry_date: purchase.asc_expiry_date }),
      customer_id,
      product_id,
      customer,
      product,
    } as CreatePurchaseInput;
  }
  private toFormValue(data: Purchase): FormGroup<IInvoiceForm>['value'] {
    const purchase = data;
    const product = purchase.product;
    const customer = purchase.customer;
    return {
      purchase,
      customer,
      product,
    };
  }
}
