import { afterRenderEffect, Component, inject, input, output } from '@angular/core';
import { Button } from '../shared/components/ui/button';
import { Input } from '../shared/components/form/basic/input';
import { Modal } from '../shared/components/model/modal';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CustomerResource } from './customer-resource';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';

export interface ICustomerForm {
  name: NonNullable<FormControl<string>>;
  mobile: NonNullable<FormControl<string>>;
  alt_mobile: FormControl<string | null>;
  email: FormControl<string | null>;
  address: FormControl<string | null>;
  house_office: FormControl<string | null>;
  street_building: FormControl<string | null>;
  area: FormControl<string | null>;
  pincode: FormControl<string | null>;
  district: FormControl<string | null>;
}

@Component({
  selector: 'app-customer-form',
  imports: [Button, Modal, Input, ReactiveFormsModule],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [isFullscreen]="false"
      (closeEvent)="closeModal()"
      className="max-w-[700px] p-5 lg:p-10"
    >
      <div
        class="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11"
      >
        <div class="px-2 pr-14">
          <h4 class="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {{ this.customerId() ? 'Update' : 'Add' }} Customer Information
          </h4>
          <p class="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Please fill out the form below to add or update a customer record. Ensure all necessary
            fields are completed accurately to maintain high data quality.
          </p>
        </div>

        <form
          [formGroup]="form"
          (ngSubmit)="this.customerId() ? update() : save()"
          class="flex flex-col"
        >
          <div class="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <h5 class="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
              Personal Information
            </h5>

            <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <div class="col-span-1">
                <app-input id="name" label="Name" placeholder="Name" formControlName="name" />
              </div>

              <div class="col-span-1">
                <app-input
                  id="mobile"
                  label="Mobile"
                  placeholder="Primary"
                  formControlName="mobile"
                />
              </div>

              <div class="col-span-1">
                <app-input
                  id="alt_mobile"
                  label="Alternate Mobile"
                  placeholder="Secondary"
                  formControlName="alt_mobile"
                />
              </div>

              <div class="col-span-1">
                <app-input
                  id="email"
                  label="Email"
                  type="text"
                  placeholder="Email"
                  formControlName="email"
                  [error]="form.getError('email', 'email')"
                  [hint]="
                    form.getError('email', 'email') ? 'This is an invalid email address.' : ''
                  "
                />
              </div>
            </div>

            <h5 class="my-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
              Address Information
            </h5>

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

            <div class="flex items-center justify-end w-full gap-3 mt-6">
              <app-button type="reset" size="sm" variant="outline" (btnClick)="closeModal()">
                Close
              </app-button>
              <app-button type="submit" size="sm" [disabled]="form.invalid">
                {{ this.customerId() ? 'Update' : 'Add' }} Changes
              </app-button>
            </div>
          </div>
        </form>
      </div>
    </app-modal>
  `,
})
export class CustomerForm {
  readonly customerId = input('');
  readonly isOpen = input(false);
  readonly closed = output();
  protected customerResource = inject(CustomerResource);

  protected form = new FormGroup<ICustomerForm>({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    mobile: new FormControl('', { nonNullable: true, validators: Validators.required }),
    alt_mobile: new FormControl(null),
    email: new FormControl(null, [Validators.email]),
    address: new FormControl(null),
    house_office: new FormControl(null),
    street_building: new FormControl(null),
    area: new FormControl(null),
    pincode: new FormControl(null),
    district: new FormControl(null),
  });

  protected resource = rxResource({
    params: () => this.customerId(),
    stream: ({ params }) => (params ? this.customerResource.customer(params) : EMPTY),
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.resource.hasValue()) {
        const data = this.resource.value().customer;
        this.form.patchValue(data);
      }
    });
  }

  closeModal() {
    this.form.reset();
    this.closed.emit();
  }

  save() {
    this.customerResource.create(this.form.value).subscribe({
      complete: () => this.closeModal(),
    });
  }

  update() {
    const customerData = {
      ...this.form.value,
      id: +this.customerId(),
    };

    this.customerResource.update(customerData).subscribe({
      complete: () => this.closeModal(),
    });
  }
}
