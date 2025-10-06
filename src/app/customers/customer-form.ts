import {
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { Button } from '../shared/components/ui/button';
import { Input } from '../shared/components/form/basic/input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomerResource } from './customer-resource';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { PhoneInput } from '../shared/components/form/phone-input';
import { CustomerFormService, ICustomerForm } from './customer-form-service';

@Component({
  selector: 'app-customer-form',
  imports: [Button, Input, ReactiveFormsModule, PhoneInput],
  template: `
    <form [formGroup]="form()" (ngSubmit)="handleFormSubmit()" class="flex flex-col">
      <div class="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
        <h4 class="mb-5 text-base text-gray-800 dark:text-white/90 lg:mb-6">
          Personal Information
        </h4>

        <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div class="col-span-1">
            <app-input id="name" label="Name" placeholder="Name" formControlName="name" />
          </div>

          <div class="col-span-1">
            <app-phone-input
              id="mobile"
              label="Mobile"
              placeholder="Primary"
              formControlName="mobile"
              [error]="
                !!(
                  form().get('mobile')?.errors &&
                  (form().get('mobile')?.touched || form().get('mobile')?.dirty)
                )
              "
              [hint]="
                form().get('mobile')?.hasError('pattern') &&
                (form().get('mobile')?.touched || form().get('mobile')?.dirty)
                  ? 'This seems to be an invalid Number.'
                  : ''
              "
            />
          </div>

          <div class="col-span-1">
            <app-phone-input
              id="alt_mobile"
              label="Alternate Mobile"
              placeholder="Secondary"
              formControlName="alt_mobile"
              [error]="
                !!(
                  form().get('alt_mobile')?.errors &&
                  (form().get('alt_mobile')?.touched || form().get('alt_mobile')?.dirty)
                )
              "
              [hint]="
                form().get('alt_mobile')?.hasError('pattern') &&
                (form().get('alt_mobile')?.touched || form().get('alt_mobile')?.dirty)
                  ? 'This seems to be an invalid Number.'
                  : ''
              "
            />
          </div>

          <div class="col-span-1">
            <app-input
              id="email"
              label="Email"
              type="text"
              placeholder="Email"
              formControlName="email"
              [error]="form().getError('email', 'email')"
              [hint]="form().getError('email', 'email') ? 'This is an invalid email address.' : ''"
            />
          </div>
        </div>

        <h4 class="my-5 text-gray-800 dark:text-white/90 lg:mb-6">Address Information</h4>

        <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div class="col-span-1">
            <app-input
              id="address"
              label="Address"
              placeholder="Address"
              formControlName="address"
            ></app-input>
          </div>

          <div class="col-span-1">
            <app-input
              id="text"
              label="House/Office"
              placeholder="Optional"
              formControlName="house_office"
            ></app-input>
          </div>

          <div class="col-span-1">
            <app-input
              id="street_building"
              label="Street/Building"
              placeholder="Optional"
              formControlName="street_building"
            ></app-input>
          </div>

          <div class="col-span-1">
            <app-input
              id="area"
              label="Area"
              placeholder="Optional"
              formControlName="area"
            ></app-input>
          </div>

          <div class="col-span-1">
            <app-input
              id="pincode"
              label="Pincode"
              placeholder="Optional"
              formControlName="pincode"
            ></app-input>
          </div>

          <div class="col-span-1 sm:col-span-2">
            <app-input
              id="district"
              label="District"
              placeholder="Optional"
              formControlName="district"
            ></app-input>
          </div>
        </div>

        @if (!formGroup()) {
          <div class="flex items-center justify-end w-full gap-3 mt-6">
            <app-button type="reset" size="sm" variant="outline" (btnClick)="closeModal()">
              Close
            </app-button>
            <app-button type="submit" size="sm" [disabled]="form().invalid">
              {{ this.customerId() ? 'Update' : 'Add' }} Changes
            </app-button>
          </div>
        }
      </div>
    </form>
  `,
})
export class CustomerForm {
  readonly formGroup = input<FormGroup<ICustomerForm>>();
  readonly reset = input<boolean>();
  readonly formSubmit = output();
  readonly customerId = input('');
  protected customerResource = inject(CustomerResource);
  protected destroyRef = inject(DestroyRef);
  protected customerFormService = inject(CustomerFormService);

  protected form = computed<FormGroup<ICustomerForm>>(
    () => this.formGroup() ?? this.customerFormService.customerForm,
  );

  protected resource = rxResource({
    params: () => this.customerId(),
    stream: ({ params }) => (params ? this.customerResource.customer(params) : EMPTY),
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.resource.hasValue()) {
        const data = this.resource.value().customer;
        this.form().patchValue(data);
      }
    });
  }

  closeModal() {
    this.form().reset();
    this.formSubmit.emit();
  }

  handleFormSubmit() {
    return this.customerId() ? this.update() : this.save();
  }

  save() {
    this.customerResource.create(this.form().value).subscribe({
      complete: () => this.closeModal(),
    });
  }

  update() {
    const customerData = {
      ...this.form().value,
      id: +this.customerId(),
    };

    this.customerResource.update(customerData).subscribe({
      complete: () => this.closeModal(),
    });
  }
}
