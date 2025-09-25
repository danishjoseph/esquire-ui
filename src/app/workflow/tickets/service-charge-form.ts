import { afterRenderEffect, Component, input, output } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Input } from '../../shared/components/form/basic/input';

export interface IServiceCharge {
  quotation_amount: FormControl<string | null>;
  service_charge: FormControl<string | null>;
  advance_amount: FormControl<string | null>;
  total_amount: FormControl<string | null>;
  gst_amount: FormControl<string | null>;
}

const numberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  // Check if the value is a number and that it is >= 0
  return !isNaN(value) && parseFloat(value) >= 0 ? null : { notNumber: true };
};

@Component({
  selector: 'app-service-charge-form',
  imports: [ReactiveFormsModule, Input],
  template: `
    <form [formGroup]="form" (ngSubmit)="handleFormSubmit()">
      <h4 class="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">Summary of Charges</h4>

      <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div class="col-span-1">
          <app-input
            type="tel"
            id="quotation_amount"
            label="Qutation Amount"
            placeholder="Amount Quoted"
            formControlName="quotation_amount"
            [error]="
              !!(
                form.get('quotation_amount')?.errors &&
                (form.get('quotation_amount')?.touched || form.get('quotation_amount')?.dirty)
              )
            "
          />
        </div>

        <div class="col-span-1">
          <app-input
            type="tel"
            id="service_charge"
            label="Service Charge"
            placeholder="Service Charges"
            formControlName="service_charge"
            [error]="
              !!(
                form.get('service_charge')?.errors &&
                (form.get('service_charge')?.touched || form.get('service_charge')?.dirty)
              )
            "
          />
        </div>

        <div class="col-span-1">
          <app-input
            type="tel"
            id="advance_amount"
            label="Advance Amount"
            placeholder="Advance Amount Collected"
            formControlName="advance_amount"
            [error]="
              !!(
                form.get('advance_amount')?.errors &&
                (form.get('advance_amount')?.touched || form.get('advance_amount')?.dirty)
              )
            "
          />
        </div>

        <div class="col-span-1">
          <app-input
            type="tel"
            id="total_amount"
            label="Total Amount"
            placeholder="Total Charges"
            formControlName="total_amount"
          />
        </div>

        <div class="col-span-1">
          <app-input
            id="gst_amount"
            label="GST Charges (18%)"
            formControlName="gst_amount"
            [disabled]="true"
          />
        </div>
      </div>
    </form>
  `,
})
export class ServiceChargeForm {
  readonly formGroup = input<FormGroup>();
  readonly formSubmit = output();
  readonly productId = input('');
  public effectiveAmount = 0;
  public gstAmount = 0;
  public totalAmount = 0;

  protected form = new FormGroup<IServiceCharge>({
    quotation_amount: new FormControl('', [Validators.required, numberValidator]),
    service_charge: new FormControl('', [Validators.required, numberValidator]),
    advance_amount: new FormControl('', [Validators.required, numberValidator]),
    total_amount: new FormControl({ value: '0', disabled: true }, [numberValidator]),
    gst_amount: new FormControl({ value: '0', disabled: true }, [numberValidator]),
  });

  handleFormSubmit() {
    console.log('form values', this.form.value, 'valid', this.form.valid);
  }

  constructor() {
    afterRenderEffect(() => {
      this.form.valueChanges.subscribe(() => this.setupCalculations());
    });
  }

  private setupCalculations() {
    const quotationValue = this.form.controls.quotation_amount.value;
    const serviceChargeValue = this.form.controls.service_charge.value;
    const advanceAmountValue = this.form.controls.advance_amount.value;
    // Parsing and ensuring default value as 0 for any invalid input
    const quotationAmount = parseFloat(quotationValue ?? '0') || 0;
    const serviceCharge = parseFloat(serviceChargeValue ?? '0') || 0;
    const advanceAmount = parseFloat(advanceAmountValue ?? '0') || 0;

    // Determine effective amount by prioritizing a valid service charge
    this.effectiveAmount = serviceCharge > 0 ? serviceCharge : quotationAmount;

    // Calculate GST and total based on a valid effective amount
    if (this.effectiveAmount > 0 || advanceAmount > 0) {
      this.gstAmount = this.effectiveAmount * 0.18;
      this.totalAmount = this.effectiveAmount + this.gstAmount - advanceAmount;

      // Update form controls with ensured non-negative total, formatted to two decimal places
      this.form.controls.total_amount.setValue(Math.max(this.totalAmount, 0).toFixed(2), {
        emitEvent: false,
      });
      this.form.controls.gst_amount.setValue(this.gstAmount.toFixed(2), { emitEvent: false });
    }
  }
}
