import {
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Input } from '../../shared/components/form/basic/input';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketFormService, IServiceCharge } from './ticket-form-service';
import { TicketResource } from './ticket-resource';
import { EMPTY } from 'rxjs';
import { Button } from '../../shared/components/ui/button';
import { NotificationService } from '../../shared/components/ui/notification-service';

@Component({
  selector: 'app-service-charge-form',
  imports: [ReactiveFormsModule, Input, Button],
  template: `
    <form [formGroup]="form()" (ngSubmit)="handleFormSubmit()">
      <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div class="col-span-1">
          <app-input
            type="tel"
            id="advance_amount"
            label="Advance Amount"
            placeholder="Advance Amount Collected"
            formControlName="advance_amount"
            [error]="
              !!(
                (form().get('advance_amount')?.errors || form().hasError('advanceAmountTooHigh')) &&
                (form().get('advance_amount')?.touched || form().get('advance_amount')?.dirty)
              )
            "
            [hint]="
              form().hasError('advanceAmountTooHigh')
                ? 'Advance amount should not exceed the quotation amount.'
                : ''
            "
          />
        </div>

        @if (ticketId()) {
          <div class="col-span-1">
            <app-input
              type="tel"
              id="service_charge"
              label="Service Charge"
              placeholder="Service Charges"
              formControlName="service_charge"
              [error]="
                !!(
                  form().get('service_charge')?.errors &&
                  (form().get('service_charge')?.touched || form().get('service_charge')?.dirty)
                )
              "
            />
          </div>
          <div class="col-span-1">
            <app-input
              type="tel"
              id="quotation_amount"
              label="Qutation Amount"
              placeholder="Amount Quoted"
              formControlName="quotation_amount"
              [error]="
                !!(
                  form().get('quotation_amount')?.errors &&
                  (form().get('quotation_amount')?.touched || form().get('quotation_amount')?.dirty)
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
            <app-input id="gst_amount" label="GST Charges (18%)" formControlName="gst_amount" />
          </div>
        }
        @if (!formGroup()) {
          <div class="flex items-center justify-end w-full gap-3 mt-6">
            <app-button type="reset" size="sm" variant="outline" (btnClick)="closeModal()">
              Close
            </app-button>
            <app-button type="submit" size="sm" [disabled]="form().invalid"> Update </app-button>
          </div>
        }
      </div>
    </form>
  `,
})
export class ServiceChargeForm {
  readonly formGroup = input<FormGroup<IServiceCharge>>();
  readonly formSubmit = output();
  readonly ticketId = input('');
  public effectiveAmount = 0;
  public gstAmount = 0;
  public totalAmount = 0;

  protected ticketResource = inject(TicketResource);
  protected ticketFormService = inject(TicketFormService);
  protected notificationService = inject(NotificationService);

  handleFormSubmit() {
    const { quotation_amount, service_charge, gst_amount, total_amount, advance_amount } =
      this.form().getRawValue();
    this.ticketResource
      .updateServiceCharge({
        id: Number(this.ticketId()),
        quotation_amount: Number(quotation_amount),
        service_charge: Number(service_charge),
        gst_amount: Number(gst_amount),
        total_amount: Number(total_amount),
        advance_amount: Number(advance_amount),
      })
      .subscribe({
        complete: () => {
          this.notificationService.showNotification('Service Charges updated');
          this.closeModal();
        },
      });
  }

  protected destroyRef = inject(DestroyRef);

  protected form = computed<FormGroup<IServiceCharge>>(
    () => this.formGroup() ?? this.ticketFormService.serviceChargeForm,
  );

  protected resource = rxResource({
    params: () => this.ticketId(),
    stream: ({ params }) => (params ? this.ticketResource.ticket(params) : EMPTY),
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.resource.hasValue()) {
        const data = this.resource.value().service;
        this.form().patchValue({
          service_charge: data.service_charge.toString(),
          advance_amount: data.advance_amount.toString(),
          quotation_amount: data.quotation_amount.toString(),
          gst_amount: data.quotation_amount.toString(),
          total_amount: data.quotation_amount.toString(),
        });
      }
      this.form()
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.setupCalculations());
    });

    this.destroyRef.onDestroy(() => {
      this.form().reset();
    });
  }

  closeModal() {
    this.form().reset();
    this.formSubmit.emit();
  }

  private setupCalculations() {
    const quotationValue = this.form().controls.quotation_amount.value;
    const serviceChargeValue = this.form().controls.service_charge.value;
    const advanceAmountValue = this.form().controls.advance_amount.value;
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
      this.form().controls.total_amount.setValue(Math.max(this.totalAmount, 0).toFixed(2), {
        emitEvent: false,
      });
      this.form().controls.gst_amount.setValue(this.gstAmount.toFixed(2), {
        emitEvent: false,
      });
    }
  }
}
