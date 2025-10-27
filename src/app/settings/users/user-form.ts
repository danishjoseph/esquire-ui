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
import { IUserForm, UserFormService } from './user-form-service';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserResource, UserRole } from './user-resource';
import { NotificationService } from '../../shared/components/ui/notification-service';
import { EMPTY } from 'rxjs';
import { Option, Select } from '../../shared/components/form/basic/select';
import { PhoneInput } from '../../shared/components/form/phone-input';
import { Input } from '../../shared/components/form/basic/input';
import { Button } from '../../shared/components/ui/button';

export const roleOptions: Option[] = [
  { value: UserRole.FOE, label: 'FOE' },
  { value: UserRole.ADMIN, label: 'Admin' },
  { value: UserRole.ENGINEER, label: 'Engineer' },
];

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, Select, PhoneInput, Input, Button],
  template: `
    <form [formGroup]="form()" (ngSubmit)="handleFormSubmit()">
      <div class="overflow-y-auto px-2 pb-3">
        <h4 class="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">User Information</h4>

        <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div class="col-span-1">
            <app-select
              id="role"
              label="Role"
              placeholder="Select Suitable Role"
              formControlName="role"
              [options]="roleOptions"
            />
          </div>

          <div class="col-span-1">
            <app-input id="name" label="Name" placeholder="Name" formControlName="name" />
          </div>

          <div class="col-span-1">
            <app-phone-input
              id="mobile"
              label="Mobile"
              placeholder="Mobile"
              formControlName="mobile"
              [error]="
                !!(
                  form().get('mobile')?.errors &&
                  (form().get('mobile')?.touched || form().get('mobile')?.dirty)
                )
              "
              [hint]="
                form().get('mobile')?.hasError('pattern') &&
                (form().get('mobile')?.touched || form().get('mobile')?.dirty)
                  ? 'This seems to be an invalid Number.'
                  : ''
              "
            />
          </div>

          <div class="col-span-1">
            <app-input
              id="email"
              label="Email"
              type="text"
              placeholder="Email"
              formControlName="email"
              [error]="form().getError('email', 'email')"
              [hint]="form().getError('email', 'email') ? 'This is an invalid email address.' : ''"
            />
          </div>

          <div class="col-span-1 sm:col-span-2">
            <app-input
              id="sub"
              label="Cognito Sub"
              placeholder="Cognito Sub"
              formControlName="sub"
            />
          </div>
        </div>

        @if (!formGroup()) {
          <div class="flex items-center justify-end w-full gap-3 mt-6">
            @if (userId()) {
              <app-button type="reset" size="sm" variant="outline" (btnClick)="closeModal()">
                Close
              </app-button>
            } @else {
              <app-button type="reset" size="sm" variant="outline" (btnClick)="clear()">
                Clear
              </app-button>
            }
            <app-button type="submit" size="sm" [disabled]="form().invalid">
              {{ this.userId() ? 'Update' : 'Add' }} Changes
            </app-button>
          </div>
        }
      </div>
    </form>
  `,
})
export class UserForm {
  readonly formGroup = input<FormGroup<IUserForm>>();
  readonly formSubmit = output();
  readonly userId = input('');

  private destroyRef = inject(DestroyRef);
  protected userResource = inject(UserResource);
  protected userFormService = inject(UserFormService);
  protected notificationService = inject(NotificationService);
  protected roleOptions = roleOptions;

  protected form = computed<FormGroup<IUserForm>>(
    () => this.formGroup() ?? this.userFormService.userForm,
  );

  protected resource = rxResource({
    params: () => this.userId(),
    stream: ({ params }) => (params ? this.userResource.user(params) : EMPTY),
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.resource.hasValue()) {
        const data = this.resource.value().user;
        this.form().patchValue(data);
        this.form().get('role')?.disable();
        this.form().get('sub')?.disable();
      }
    });
    this.destroyRef.onDestroy(() => {
      this.clear();
    });
  }

  closeModal() {
    this.formSubmit.emit();
  }

  clear() {
    this.form().reset();
    Object.keys(this.form().controls).forEach((field) => {
      const control = this.form().get(field);
      control?.enable();
    });
  }

  handleFormSubmit() {
    return this.userId() ? this.update() : this.save();
  }

  save() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...createData } = this.form().value;
    this.userResource.create(createData).subscribe({
      complete: () => {
        this.notificationService.showNotification('User Saved', 'success');
        this.closeModal();
      },
    });
  }

  update() {
    const updateData = {
      ...this.form().value,
      id: +this.userId(),
    };

    this.userResource
      .update(updateData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.notificationService.showNotification('User Updated', 'success');
          this.closeModal();
        },
      });
  }
}
