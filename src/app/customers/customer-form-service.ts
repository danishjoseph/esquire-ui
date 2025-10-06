import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

@Injectable({
  providedIn: 'root',
})
export class CustomerFormService {
  readonly customerForm = new FormGroup<ICustomerForm>({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    mobile: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern('^[+]?[0-9]+$'), // Validates optional + and digits
        Validators.minLength(13),
        Validators.maxLength(13),
      ],
    }),
    alt_mobile: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.pattern('^[+]?[0-9]+$'), // Validates optional + and digits
        Validators.minLength(13),
        Validators.maxLength(13),
      ],
    }),
    email: new FormControl(null, [Validators.email]),
    address: new FormControl(null),
    house_office: new FormControl(null),
    street_building: new FormControl(null),
    area: new FormControl(null),
    pincode: new FormControl(null),
    district: new FormControl(null),
  });
}
