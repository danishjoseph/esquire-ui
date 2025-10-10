import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { PurchaseStatus, ServiceStatus, WarrantyStatus } from './purchase-info-form';

export enum LogType {
  DIAGNOSIS = 'DIAGNOSIS',
  COMPLAINTS = 'COMPLAINTS',
  STATUS_UPDATE = 'STATUS_UPDATE',
  FEEDBACK = 'FEEDBACK',
}

export enum ProductCondition {
  EXCELLENT = 'EXCELLENT',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  POOR = 'POOR',
  VERY_POOR = 'VERY_POOR',
  DAMAGED = 'DAMAGED',
}

export interface IWorkLog {
  // created_by: FormControl<string | null>;
  service_log_type: FormControl<NonNullable<LogType>>;
  log_description: FormControl<string | null>;
}

export interface IAccessory {
  accessory_name: FormControl<string>;
  accessory_received: FormControl<boolean>;
}

export interface IWorkLogForm {
  product_condition: FormControl<NonNullable<ProductCondition>>;
  work_logs: FormArray<FormGroup<IWorkLog>>;
  accessories: FormArray<FormGroup<IAccessory>>;
}

export interface IServiceCharge {
  quotation_amount: NonNullable<FormControl<string>>;
  service_charge: NonNullable<FormControl<string>>;
  advance_amount: NonNullable<FormControl<string>>;
  total_amount: NonNullable<FormControl<string>>;
  gst_amount: NonNullable<FormControl<string>>;
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

export const numberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  // Check if the value is a number and that it is >= 0
  return !isNaN(value) && parseFloat(value) >= 0 ? null : { notNumber: true };
};

@Injectable({
  providedIn: 'root',
})
export class TicketFormService {
  readonly worklogForm = new FormGroup<IWorkLogForm>({
    product_condition: new FormControl(ProductCondition.GOOD, { nonNullable: true }),
    work_logs: new FormArray<FormGroup<IWorkLog>>([]),
    accessories: new FormArray<FormGroup<IAccessory>>([]),
  });

  readonly purchaseInfoForm = new FormGroup<IPurchaseInfo>({
    purchase_status: new FormControl(PurchaseStatus.ESQUIRE, {
      nonNullable: true,
      validators: Validators.required,
    }),
    warranty_status: new FormControl(null, {
      validators: Validators.required,
    }),
  });

  readonly serviceChargeForm = new FormGroup<IServiceCharge>({
    quotation_amount: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, numberValidator],
    }),
    service_charge: new FormControl('0', { nonNullable: true, validators: [numberValidator] }),
    advance_amount: new FormControl('', { nonNullable: true, validators: [numberValidator] }),
    total_amount: new FormControl(
      { value: '0', disabled: true },
      { nonNullable: true, validators: [numberValidator] },
    ),
    gst_amount: new FormControl(
      { value: '0', disabled: true },
      { nonNullable: true, validators: [numberValidator] },
    ),
  });
}
