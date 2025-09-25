import { afterRenderEffect, Component, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Option, Select } from '../../shared/components/form/basic/select';
import { CommonModule, JsonPipe } from '@angular/common';
import { Input } from '../../shared/components/form/basic/input';

enum PurchaseStatus {
  ESQUIRE = 'ESQUIRE',
  NON_ESQUIRE = 'NON_ESQUIRE',
}

enum WarrantyStatus {
  UNDER_1YR = 'UNDER_1YR',
  WARRANTY_UPGRADE = 'WARRANTY_UPGRADE',
  ASC = 'ASC',
  NON_WARRANTY = 'NON_WARRANTY',
}

enum ServiceStatus {
  CHARGEABLE = 'CHARGEABLE',
  WARRANTY_FREE = 'WARRANTY_FREE',
  FREE = 'FREE',
}

export interface IPurchaseInfo {
  purchase_status: FormControl<NonNullable<PurchaseStatus>>;
  warranty_status: FormControl<WarrantyStatus | null>;
  purchase_date?: FormControl<Date | null>;
  invoice_number?: FormControl<string | null>;
  warranty_expiry?: FormControl<Date | null>;
  asc_start_date?: FormControl<Date | null>;
  asc_expiry_date?: FormControl<Date | null>;
  service_status?: FormControl<ServiceStatus | null>;
  invoice_number_retype?: FormControl<string | null>;
}

@Component({
  selector: 'app-purchase-info-form',
  imports: [ReactiveFormsModule, Select, Input],
  template: `
    <form [formGroup]="form" (ngSubmit)="handleFormSubmit()">
      <h4 class="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
        Purchase Information
      </h4>

      <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div class="col-span-1">
          <app-select
            id="name"
            label="Purchase Status"
            placeholder="Purchase Status"
            formControlName="purchase_status"
            [options]="purchaseOptions"
          />
        </div>

        <div class="col-span-1">
          <app-select
            id="name"
            label="Warranty Status"
            placeholder="Warranty Status"
            formControlName="warranty_status"
            [options]="warrantyOptions()"
          />
        </div>
        @if (form.get('purchase_date')) {
          <div class="col-span-1">
            <app-input
              id="purchase_date"
              type="date"
              label="Purchase Date"
              placeholder="Select Purchase Date"
              formControlName="purchase_date"
            />
          </div>
        }
        @if (form.get('invoice_number')) {
          <div class="col-span-1">
            <app-input
              id="invoice_number"
              label="Invoice Number"
              placeholder="Enter Invoice Number"
              formControlName="invoice_number"
            />
          </div>
        }
        @if (form.get('warranty_expiry')) {
          <div class="col-span-1">
            <app-input
              id="warranty_expiry"
              type="date"
              label="Warranty Expiry"
              placeholder="Enter Warrant Expiry"
              formControlName="warranty_expiry"
            />
          </div>
        }
        @if (form.get('asc_start_date')) {
          <div class="col-span-1">
            <app-input
              id="asc_start_date"
              type="date"
              label="ASC Start Date"
              placeholder="Enter ASC Start Date"
              formControlName="asc_start_date"
            />
          </div>
        }
        @if (form.get('asc_expiry_date')) {
          <div class="col-span-1">
            <app-input
              id="asc_expiry_date"
              type="date"
              label="ASC End Date"
              placeholder="Enter ASC End Date"
              formControlName="asc_expiry_date"
            />
          </div>
        }

        @if (form.get('service_status')) {
          <div class="col-span-1">
            <app-select
              id="service_status"
              label="Service Status"
              placeholder="Select Service Status"
              formControlName="service_status"
              [options]="serviceStatusOptions()"
            />
          </div>
        }
        @if (form.get('invoice_number_retype')) {
          <div class="col-span-2">
            <app-input
              id="service_status"
              label="Invoice Number"
              placeholder="Retype Invoice Number"
            />
          </div>
        }
      </div>
    </form>
  `,
})
export class PurchaseInfoForm {
  readonly productId = input('');
  readonly WARRANTY_STATUS = WarrantyStatus;
  readonly SERVICE_STATUS = ServiceStatus;

  protected form = new FormGroup<IPurchaseInfo>({
    purchase_status: new FormControl(PurchaseStatus.ESQUIRE, {
      nonNullable: true,
      validators: Validators.required,
    }),
    warranty_status: new FormControl(null, {
      validators: Validators.required,
    }),
  });

  readonly purchaseOptions: Option[] = [
    { value: PurchaseStatus.NON_ESQUIRE, label: 'Non Esquire' },
    { value: PurchaseStatus.ESQUIRE, label: 'Esquire' },
  ];

  #warrantyOptions: Option[] = [
    { value: WarrantyStatus.WARRANTY_UPGRADE, label: 'Warranty Upgrade' },
    { value: WarrantyStatus.ASC, label: 'ASC' },
    { value: WarrantyStatus.NON_WARRANTY, label: 'Non Warranty' },
    { value: WarrantyStatus.UNDER_1YR, label: 'Under 1 Year' },
  ];

  #serviceStatusOptions: Option[] = [
    { value: ServiceStatus.FREE, label: 'Free' },
    { value: ServiceStatus.CHARGEABLE, label: 'Chargeable' },
    { value: ServiceStatus.WARRANTY_FREE, label: 'Warranty Free' },
  ];

  readonly warrantyOptions = signal<Option[]>(this.#warrantyOptions);
  readonly serviceStatusOptions = signal<Option[]>(this.#serviceStatusOptions);

  constructor() {
    afterRenderEffect(() => {
      this.form.controls.purchase_status.valueChanges.subscribe((purchaseStatus) => {
        this.onStatusChange(purchaseStatus, this.form.controls.warranty_status.value);
      });

      this.form.controls.warranty_status.valueChanges.subscribe((warrantyStatus) => {
        this.onStatusChange(this.form.controls.purchase_status.value, warrantyStatus);
      });

      this.form.controls.service_status?.valueChanges.subscribe((status) => {
        console.log('Service Status Changed:', status);
        this.updateInvoiceNumberRetype(status);
      });
    });
  }

  private updateInvoiceNumberRetype(status: ServiceStatus | null) {
    const control = this.form.get('invoice_number_retype');
    console.log('control', control);

    if (status === ServiceStatus.WARRANTY_FREE && !control) {
      this.form.addControl('invoice_number_retype', new FormControl('', Validators.required));
    } else if (status !== ServiceStatus.WARRANTY_FREE && control) {
      this.form.removeControl('invoice_number_retype');
    }
  }

  private onStatusChange(purchaseStatus: PurchaseStatus, warrantyStatus: WarrantyStatus | null) {
    // Clear all dynamically added controls to avoid overlapping state
    this.clearDynamicControls();
    this.filterWarrantyOptions(purchaseStatus);

    switch (warrantyStatus) {
      case WarrantyStatus.UNDER_1YR:
        if (purchaseStatus === PurchaseStatus.ESQUIRE) {
          this.form.addControl('purchase_date', new FormControl(new Date()));
          this.form.addControl('invoice_number', new FormControl(''));
          this.form.setControl('service_status', new FormControl(ServiceStatus.FREE), {
            emitEvent: true,
          });
        }
        break;
      case WarrantyStatus.WARRANTY_UPGRADE:
        if (purchaseStatus === PurchaseStatus.ESQUIRE) {
          this.form.addControl('purchase_date', new FormControl(new Date()));
          this.form.addControl('warranty_expiry', new FormControl(new Date()));
          this.form.setControl('service_status', new FormControl(), { emitEvent: true });
        }
        break;
      case WarrantyStatus.ASC:
        this.form.addControl('asc_start_date', new FormControl(new Date()));
        this.form.addControl('asc_expiry_date', new FormControl(new Date()));
        break;
      case WarrantyStatus.NON_WARRANTY:
        // Disable all inputs
        this.clearDynamicControls();
        break;
      default:
        break;
    }
  }

  private clearDynamicControls() {
    if (this.form.get('purchase_date')) this.form.removeControl('purchase_date');
    if (this.form.get('invoice_number')) this.form.removeControl('invoice_number');
    if (this.form.get('warranty_expiry')) this.form.removeControl('warranty_expiry');
    if (this.form.get('asc_start_date')) this.form.removeControl('asc_start_date');
    if (this.form.get('asc_expiry_date')) this.form.removeControl('asc_expiry_date');
  }

  private filterWarrantyOptions(purchaseStatus: PurchaseStatus) {
    if (purchaseStatus === PurchaseStatus.NON_ESQUIRE) {
      this.warrantyOptions.set([
        { value: WarrantyStatus.ASC, label: 'ASC' },
        { value: WarrantyStatus.NON_WARRANTY, label: 'Non Warranty' },
      ]);
    } else {
      this.warrantyOptions.set(this.#warrantyOptions);
    }
  }

  handleFormSubmit() {
    console.log('form values', this.form.value, 'valid', this.form.valid);
  }
}
