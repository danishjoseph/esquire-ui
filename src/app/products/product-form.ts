import { afterRenderEffect, Component, inject, input, output } from '@angular/core';
import { Button } from '../shared/components/ui/button';
import { Input } from '../shared/components/form/basic/input';
import { Modal } from '../shared/components/model/modal';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProductCategory, ProductResource } from './product-resource';
import { rxResource } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';

export interface IProductForm {
  name: NonNullable<FormControl<string>>;
  serial_number: NonNullable<FormControl<string>>;
  category: NonNullable<FormControl<ProductCategory>>;
  brand: NonNullable<FormControl<string>>;
  model_name: FormControl<string>;
}

@Component({
  selector: 'app-product-form',
  imports: [Button, Modal, Input, ReactiveFormsModule],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      (closeEvent)="closeModal()"
      className="max-w-[700px] p-5 lg:p-10"
    >
      <form
        class="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11"
        [formGroup]="form"
        (ngSubmit)="this.productId() ? update() : save()"
      >
        <h4 class="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
          Product Information
        </h4>

        <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div class="col-span-1">
            <app-input
              id="name"
              label="Product Name"
              placeholder="Product Name"
              formControlName="name"
            />
          </div>

          <div class="col-span-1">
            <app-input
              id="model_name"
              label="Model"
              placeholder="Model Name"
              formControlName="model_name"
            />
          </div>

          <div class="col-span-1">
            <app-input
              id="category"
              label="Category"
              placeholder="Product Category"
              formControlName="category"
            />
          </div>

          <div class="col-span-1">
            <app-input
              id="brand"
              label="Brand"
              placeholder="Product Brand"
              formControlName="brand"
            />
          </div>

          <div class="col-span-1 sm:col-span-2">
            <app-input
              id="name"
              label="Serial No"
              placeholder="Serial Number"
              formControlName="serial_number"
            />
          </div>
        </div>

        <div class="flex items-center justify-end w-full gap-3 mt-6">
          <app-button type="reset" size="sm" variant="outline" (btnClick)="closeModal()">
            Close
          </app-button>
          <app-button type="submit" size="sm" [disabled]="form.invalid">
            {{ this.productId() ? 'Update' : 'Add' }} Changes
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
})
export class ProductForm {
  readonly productId = input('');
  readonly isOpen = input(false);
  readonly closed = output();
  protected productResource = inject(ProductResource);

  protected form = new FormGroup<IProductForm>({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    serial_number: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    category: new FormControl(ProductCategory.NORMAL_LAPTOP, {
      nonNullable: true,
      validators: Validators.required,
    }),
    brand: new FormControl('', { nonNullable: true, validators: Validators.required }),
    model_name: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  protected resource = rxResource({
    params: () => this.productId(),
    stream: ({ params }) => (params ? this.productResource.product(params) : EMPTY),
  });

  constructor() {
    afterRenderEffect(() => {
      this.form.reset();
      if (this.resource.hasValue()) {
        const data = this.resource.value().product;
        this.form.patchValue(data);
      }
    });
  }

  closeModal() {
    this.form.reset();
    this.closed.emit();
  }

  save() {
    this.productResource.create(this.form.value).subscribe({
      complete: () => this.closeModal(),
    });
  }

  update() {
    const productData = {
      ...this.form.value,
      id: +this.productId(),
    };

    this.productResource.update(productData).subscribe({
      error: (err) => console.log(err),
      complete: () => this.closeModal(),
    });
  }
}
