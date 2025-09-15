import { Component } from '@angular/core';
import { AvatarText } from '../shared/components/avatar/avatar-text';

@Component({
  selector: 'app-customer-table',
  imports: [AvatarText],
  template: `
    <div
      class="overflow-hidden rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/[0.05] dark:bg-white/[0.03]"
    >
      <div class="flex gap-2 px-5 mb-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <form class="sm:flex justify-end w-full">
          <div class="relative">
            <button class="absolute -translate-y-1/2 left-4 top-1/2" type="button">
              <svg
                class="fill-gray-500 dark:fill-gray-400"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z"
                  fill=""
                ></path>
              </svg>
            </button>
            <input
              type="text"
              placeholder="Search..."
              class="dark:bg-dark-900 h-[42px] w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
            />
          </div>
        </form>
      </div>

      <div class="max-w-full overflow-x-auto">
        <table class="min-w-full">
          <thead
            class="px-6 py-3.5 border-t border-gray-100 border-y bg-gray-50 dark:border-white/[0.05] dark:bg-gray-900"
          >
            <tr>
              <th
                class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
              >
                Customer ID
              </th>
              <th
                class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
              >
                Customer
              </th>
              <th
                class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
              >
                Contact
              </th>
              <th
                class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
              >
                Address
              </th>
              <th
                class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            @for (row of tableRowData; track $index) {
              <tr>
                <td class="px-4 sm:px-6 py-3.5">
                  <div class="flex items-center gap-3">
                    <div>
                      <span
                        class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400"
                      >
                        {{ row.id }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-3.5">
                  <div class="flex items-center gap-3">
                    <app-avatar-text [name]="row.user.name" class="w-10 h-10" />
                    <div>
                      <span
                        class="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400"
                      >
                        {{ row.user.name }}
                      </span>
                      <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                        {{ row.user.email }}
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-4 sm:px-6 py-3.5">
                  <span
                    class="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400"
                  >
                    {{ row.contact.primary }}
                  </span>
                  <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                    {{ row.contact.secondary }}
                  </span>
                </td>
                <td class="px-4 sm:px-6 py-3.5">
                  <p class="text-gray-700 text-theme-sm dark:text-gray-400">
                    {{ row.address }}
                  </p>
                </td>
                <td class="px-4 sm:px-6 py-3.5">
                  @if (row.actions.delete) {
                    <button>
                      <svg
                        width="1em"
                        height="1em"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="text-gray-700 cursor-pointer size-5 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M6.54142 3.7915C6.54142 2.54886 7.54878 1.5415 8.79142 1.5415H11.2081C12.4507 1.5415 13.4581 2.54886 13.4581 3.7915V4.0415H15.6252H16.666C17.0802 4.0415 17.416 4.37729 17.416 4.7915C17.416 5.20572 17.0802 5.5415 16.666 5.5415H16.3752V8.24638V13.2464V16.2082C16.3752 17.4508 15.3678 18.4582 14.1252 18.4582H5.87516C4.63252 18.4582 3.62516 17.4508 3.62516 16.2082V13.2464V8.24638V5.5415H3.3335C2.91928 5.5415 2.5835 5.20572 2.5835 4.7915C2.5835 4.37729 2.91928 4.0415 3.3335 4.0415H4.37516H6.54142V3.7915ZM14.8752 13.2464V8.24638V5.5415H13.4581H12.7081H7.29142H6.54142H5.12516V8.24638V13.2464V16.2082C5.12516 16.6224 5.46095 16.9582 5.87516 16.9582H14.1252C14.5394 16.9582 14.8752 16.6224 14.8752 16.2082V13.2464ZM8.04142 4.0415H11.9581V3.7915C11.9581 3.37729 11.6223 3.0415 11.2081 3.0415H8.79142C8.37721 3.0415 8.04142 3.37729 8.04142 3.7915V4.0415ZM8.3335 7.99984C8.74771 7.99984 9.0835 8.33562 9.0835 8.74984V13.7498C9.0835 14.1641 8.74771 14.4998 8.3335 14.4998C7.91928 14.4998 7.5835 14.1641 7.5835 13.7498V8.74984C7.5835 8.33562 7.91928 7.99984 8.3335 7.99984ZM12.4168 8.74984C12.4168 8.33562 12.081 7.99984 11.6668 7.99984C11.2526 7.99984 10.9168 8.33562 10.9168 8.74984V13.7498C10.9168 14.1641 11.2526 14.4998 11.6668 14.4998C12.081 14.4998 12.4168 14.1641 12.4168 13.7498V8.74984Z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class CustomerTable {
  tableRowData = [
    {
      id: 'ES000001',
      avatarColor: 'brand',
      user: { initials: 'VR', name: 'Vishnu Ram', email: 'vishnu.ram@example.com' },
      contact: { primary: '9400012345', secondary: '9401012345' },
      address: 'MG Road, Kochi, Kerala',
      pincode: '682001',
      actions: { delete: true },
    },
    {
      id: 'ES000002',
      avatarColor: 'brand',
      user: { initials: 'AK', name: 'Amala Kurian', email: 'amala.kurian@example.com' },
      contact: { primary: '9895123456', secondary: '9896123456' },
      address: 'Covent Junction, Trivandrum, Kerala',
      pincode: '695001',
      actions: { delete: true },
    },
    {
      id: 'ES000003',
      avatarColor: 'brand',
      user: { initials: 'SJ', name: 'Sanjeev Jose', email: 'sanjeev.jose@example.com' },
      contact: { primary: '9846123456', secondary: '9847123456' },
      address: 'Rajaji Road, Ernakulam, Kerala',
      pincode: '682017',
      actions: { delete: true },
    },
    {
      id: 'ES000004',
      avatarColor: 'light',
      user: { initials: 'NK', name: 'Neelam K', email: 'neelam.k@example.com' },
      contact: { primary: '9544123456', secondary: '9545123456' },
      address: 'East Fort, Thrissur, Kerala',
      pincode: '680001',
      actions: { delete: false },
    },
    {
      id: 'ES000005',
      avatarColor: 'dark',
      user: { initials: 'MM', name: 'Mohan Mathew', email: 'mohan.mathew@example.com' },
      contact: { primary: '9745123456', secondary: '9746123456' },
      address: 'Oottery Junction, Calicut, Kerala',
      pincode: '673001',
      actions: { delete: true },
    },
    {
      id: 'ES000006',
      avatarColor: 'brand',
      user: { initials: 'PL', name: 'Pooja Lekshmi', email: 'pooja.lekshmi@example.com' },
      contact: { primary: '9061123456', secondary: '9062123456' },
      address: 'Boat Jetty Road, Alappuzha, Kerala',
      pincode: '688001',
      actions: { delete: true },
    },
    {
      id: 'ES000007',
      avatarColor: 'light',
      user: { initials: 'AJ', name: 'Anish Joseph', email: 'anish.joseph@example.com' },
      contact: { primary: '9446123456', secondary: '9447123456' },
      address: 'Main Road, Pathanamthitta, Kerala',
      pincode: '689645',
      actions: { delete: false },
    },
    {
      id: 'ES000008',
      avatarColor: 'dark',
      user: { initials: 'VS', name: 'Vimal Suresh', email: 'vimal.suresh@example.com' },
      contact: { primary: '9996123456', secondary: '9997123456' },
      address: 'High Way, Palakkad, Kerala',
      pincode: '678001',
      actions: { delete: true },
    },
    {
      id: 'ES000009',
      avatarColor: 'light',
      user: { initials: 'RJ', name: 'Ramya Jayaraj', email: 'ramya.jayaraj@example.com' },
      contact: { primary: '9210123456', secondary: '9211123456' },
      address: 'Market Road, Kollam, Kerala',
      pincode: '691001',
      actions: { delete: true },
    },
    {
      id: 'ES000010',
      avatarColor: 'brand',
      user: {
        initials: 'SB',
        name: 'Sreelatha Balachandran',
        email: 'sreelatha.balachandran@example.com',
      },
      contact: { primary: '9349123456', secondary: '9349123457' },
      address: 'Puthiyara, Malappuram, Kerala',
      pincode: '679001',
      actions: { delete: true },
    },
  ];
}
