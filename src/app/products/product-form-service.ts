import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductCategory } from './product-resource';

export interface IProductForm {
  id: FormControl<number | null>;
  name: NonNullable<FormControl<string>>;
  serial_number: NonNullable<FormControl<string>>;
  category: NonNullable<FormControl<ProductCategory>>;
  brand: NonNullable<FormControl<string>>;
  model_name: FormControl<string>;
  product_warranty: FormControl<string>;
}

@Injectable({
  providedIn: 'root',
})
export class ProductFormService {
  readonly productForm = new FormGroup<IProductForm>({
    id: new FormControl(null),
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
    product_warranty: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
}
