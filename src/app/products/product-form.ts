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
import { ProductCategory, ProductResource } from './product-resource';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { Option, Select } from '../shared/components/form/basic/select';
import { IProductForm, ProductFormService } from './product-form-service';

export const productCategoryOptions: Option[] = [
  { value: ProductCategory.NORMAL_LAPTOP, label: 'Normal Laptop' },
  { value: ProductCategory.GAMING_LAPTOP, label: 'Gaming Laptop' },
  { value: ProductCategory.TABLET, label: 'Tablet' },
  { value: ProductCategory.NORMAL_DESKTOP_CPU, label: 'Normal Desktop CPU' },
  { value: ProductCategory.GAMING_CPU, label: 'Gaming CPU' },
  { value: ProductCategory.MONITORS, label: 'Monitors' },
  { value: ProductCategory.UPS, label: 'UPS' },
  { value: ProductCategory.IPG_PRODUCTS, label: 'IPG Products' },
  { value: ProductCategory.ACCESSORIES, label: 'Accessories' },
  { value: ProductCategory.CCTV_DVR_NVR, label: 'CCTV DVR/NVR' },
  { value: ProductCategory.CCTV_CAMERA, label: 'CCTV Camera' },
  { value: ProductCategory.SMPS, label: 'SMPS' },
  { value: ProductCategory.OTHERS, label: 'Others' },
];

@Component({
  selector: 'app-product-form',
  imports: [Button, Input, ReactiveFormsModule, Select],
  template: `
    <form [formGroup]="form()" (ngSubmit)="handleFormSubmit()">
      <div class="overflow-y-auto px-2 pb-3">
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
            <app-select
              id="category"
              label="Category"
              placeholder="Select Product Category"
              formControlName="category"
              [options]="categoryOptions"
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

        @if (!formGroup()) {
          <div class="flex items-center justify-end w-full gap-3 mt-6">
            <app-button type="reset" size="sm" variant="outline" (btnClick)="closeModal()">
              Close
            </app-button>
            <app-button type="submit" size="sm" [disabled]="form().invalid">
              {{ this.productId() ? 'Update' : 'Add' }} Changes
            </app-button>
          </div>
        }
      </div>
    </form>
  `,
})
export class ProductForm {
  readonly formGroup = input<FormGroup<IProductForm>>();
  readonly formSubmit = output();
  readonly productId = input('');
  protected productResource = inject(ProductResource);
  protected destroyRef = inject(DestroyRef);
  protected productFormService = inject(ProductFormService);
  protected categoryOptions = productCategoryOptions;

  protected form = computed<FormGroup<IProductForm>>(
    () => this.formGroup() ?? this.productFormService.productForm,
  );

  protected resource = rxResource({
    params: () => this.productId(),
    stream: ({ params }) => (params ? this.productResource.product(params) : EMPTY),
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.resource.hasValue()) {
        const data = this.resource.value().product;
        this.form().patchValue(data);
      }
    });
  }

  closeModal() {
    this.form().reset();
    this.formSubmit.emit();
  }

  handleFormSubmit() {
    return this.productId() ? this.update() : this.save();
  }

  save() {
    this.productResource.create(this.form().value).subscribe({
      complete: () => this.closeModal(),
    });
  }

  update() {
    const productData = {
      ...this.form().value,
      id: +this.productId(),
    };

    this.productResource
      .update(productData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => console.log(err),
        complete: () => this.closeModal(),
      });
  }
}
