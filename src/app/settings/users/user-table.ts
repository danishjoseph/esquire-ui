import { Component, inject, input, model, signal } from '@angular/core';
import { User, UserResource, UserRole } from './user-resource';
import { Button } from '../../shared/components/ui/button';
import { UserModal } from './user-modal';
import { BadgeColor, Badge } from '../../shared/components/ui/badge';

@Component({
  selector: 'app-user-table',
  imports: [Button, UserModal, Badge],
  template: `
    <table class="min-w-full">
      <thead
        class=" sticky top-0 px-6 py-3.5 border-t border-gray-100 border-y bg-gray-50 dark:border-white/[0.05] dark:bg-gray-900"
      >
        <tr>
          <th
            class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
          >
            Cognito Sub
          </th>
          <th
            class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
          >
            Name
          </th>
          <th
            class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
          >
            Role
          </th>
          <th
            class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
          >
            Mobile
          </th>
          <th
            class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
          >
            Email
          </th>
          <th
            class="px-4 py-3 font-normal text-gray-500 text-start text-theme-sm dark:text-gray-400"
          >
            <span class="sr-only">Action</span>
          </th>
        </tr>
      </thead>
      <tbody>
        @for (row of data(); track $index) {
          <tr>
            <td class="px-4 sm:px-6 py-3.5">
              <p class="text-gray-700 text-theme-sm dark:text-gray-400">
                {{ row.sub }}
              </p>
            </td>
            <td class="px-4 sm:px-6 py-3.5">
              <p class="text-gray-700 text-theme-sm dark:text-gray-400">
                {{ row.name }}
              </p>
            </td>
            <td class="px-4 py-4 text-gray-700 whitespace-nowrap text-theme-sm dark:text-gray-400">
              <app-badge size="sm" [color]="userRoleStatusMap[row.role].color">
                {{ userRoleStatusMap[row.role].label }}
              </app-badge>
            </td>
            <td class="px-4 sm:px-6 py-3.5">
              <p class="text-gray-700 text-theme-sm dark:text-gray-400">
                {{ row.mobile ? row.mobile : '-' }}
              </p>
            </td>
            <td class="px-4 sm:px-6 py-3.5">
              <p class="text-gray-700 text-theme-sm dark:text-gray-400">
                {{ row.email ? row.email : '-' }}
              </p>
            </td>
            <td class="px-4 sm:px-6 py-3.5">
              <app-button
                size="xs"
                className="hover:text-blue-light-500"
                variant="transparent"
                [startIcon]="editIcon"
                (btnClick)="updateUser(row.id.toString())"
              />
            </td>
          </tr>
        }
      </tbody>
    </table>
    <app-user-modal [isOpen]="isOpen()" [userId]="userId()" (closed)="closeModal()" />
  `,
})
export class UserTable {
  readonly data = input.required<User[]>();
  readonly editIcon = `<svg width="1em" height="1em" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-5"><path fill-rule="evenodd" clip-rule="evenodd" d="M17.0911 3.53206C16.2124 2.65338 14.7878 2.65338 13.9091 3.53206L5.6074 11.8337C5.29899 12.1421 5.08687 12.5335 4.99684 12.9603L4.26177 16.445C4.20943 16.6931 4.286 16.9508 4.46529 17.1301C4.64458 17.3094 4.90232 17.3859 5.15042 17.3336L8.63507 16.5985C9.06184 16.5085 9.45324 16.2964 9.76165 15.988L18.0633 7.68631C18.942 6.80763 18.942 5.38301 18.0633 4.50433L17.0911 3.53206ZM14.9697 4.59272C15.2626 4.29982 15.7375 4.29982 16.0304 4.59272L17.0027 5.56499C17.2956 5.85788 17.2956 6.33276 17.0027 6.62565L16.1043 7.52402L14.0714 5.49109L14.9697 4.59272ZM13.0107 6.55175L6.66806 12.8944C6.56526 12.9972 6.49455 13.1277 6.46454 13.2699L5.96704 15.6283L8.32547 15.1308C8.46772 15.1008 8.59819 15.0301 8.70099 14.9273L15.0436 8.58468L13.0107 6.55175Z" fill="currentColor"></path></svg>`;

  protected userId = model('');
  protected isOpen = signal(false);

  protected userResource = inject(UserResource);

  openModal(id: string) {
    this.userId.set(id);
    this.isOpen.set(true);
  }

  closeModal() {
    this.userId.set('');
    this.isOpen.set(false);
  }

  updateUser(id: string) {
    this.openModal(id);
  }

  readonly userRoleStatusMap: Record<UserRole, { label: string; color: BadgeColor }> = {
    [UserRole.FOE]: {
      label: 'FOE',
      color: 'info',
    },
    [UserRole.ADMIN]: {
      label: 'Admin',
      color: 'error',
    },
    [UserRole.ENGINEER]: {
      label: 'Engineer',
      color: 'warning',
    },
  };
}
