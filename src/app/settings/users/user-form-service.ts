import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserRole } from './user-resource';

export interface IUserForm {
  id: FormControl<number | null>;
  sub: NonNullable<FormControl<string>>;
  name: NonNullable<FormControl<string>>;
  mobile: NonNullable<FormControl<string>>;
  email: NonNullable<FormControl<string>>;
  role: NonNullable<FormControl<UserRole>>;
}
@Injectable({
  providedIn: 'root',
})
export class UserFormService {
  readonly userForm = new FormGroup<IUserForm>({
    id: new FormControl(null),
    sub: new FormControl('', { nonNullable: true }),
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
    email: new FormControl('', { nonNullable: true, validators: Validators.email }),
    role: new FormControl(UserRole.FOE, { nonNullable: true, validators: Validators.required }),
  });
}
